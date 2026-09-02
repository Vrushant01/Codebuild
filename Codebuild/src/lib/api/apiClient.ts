// Centralized API Client with Caching, Credentials, and JWT Support

interface RequestOptions extends RequestInit {
  useCache?: boolean
  cacheTtlMs?: number
}

const clientCache = new Map<string, { data: any; expiry: number }>()

export const apiClient = {
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { useCache = false, cacheTtlMs = 60000, ...fetchOptions } = options
    const url = endpoint.startsWith("http") ? endpoint : `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`

    // Cache lookup for GET
    if (useCache && (!fetchOptions.method || fetchOptions.method.toUpperCase() === "GET")) {
      const cached = clientCache.get(url)
      if (cached && cached.expiry > Date.now()) {
        return cached.data as T
      }
    }

    const token = localStorage.getItem("token")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: "include", // For cookies
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`)
      }

      // Store in client cache if enabled
      if (useCache && (!fetchOptions.method || fetchOptions.method.toUpperCase() === "GET")) {
        clientCache.set(url, { data, expiry: Date.now() + cacheTtlMs })
      }

      return data as T
    } catch (error: any) {
      throw error
    }
  },

  get<T = any>(endpoint: string, useCache: boolean = false, cacheTtlMs: number = 30000): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", useCache, cacheTtlMs })
  },

  post<T = any>(endpoint: string, body?: any): Promise<T> {
    this.invalidateCache(endpoint)
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  put<T = any>(endpoint: string, body?: any): Promise<T> {
    this.invalidateCache(endpoint)
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  patch<T = any>(endpoint: string, body?: any): Promise<T> {
    this.invalidateCache(endpoint)
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  delete<T = any>(endpoint: string): Promise<T> {
    this.invalidateCache(endpoint)
    return this.request<T>(endpoint, { method: "DELETE" })
  },

  invalidateCache(prefix?: string) {
    if (!prefix) {
      clientCache.clear()
      return
    }
    for (const key of clientCache.keys()) {
      if (key.includes(prefix)) {
        clientCache.delete(key)
      }
    }
  }
}
