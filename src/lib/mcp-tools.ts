// MCP Tools Wrapper
// This file provides a simple wrapper around MCP tools

interface MCPExecuteSQLParams {
  project_id: string
  query: string
}

interface MCPContext7ResolveLibraryParams {
  libraryName: string
}

interface MCPContext7GetLibraryDocsParams {
  context7CompatibleLibraryID: string
  tokens?: number
  topic?: string
}

export async function mcp__supabase__execute_sql(params: MCPExecuteSQLParams) {
  try {
    // Try to use the actual MCP function if available
    if (typeof globalThis !== 'undefined' && 'mcp__supabase__execute_sql' in globalThis) {
      // @ts-ignore - MCP function is available in server context
      return await globalThis.mcp__supabase__execute_sql(params)
    }

    // Fallback: call the MCP API route
    const response = await fetch('/api/mcp/execute-sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'Database query failed')
    }

    return data.result
  } catch (error) {
    console.error('MCP execute SQL error:', error)
    throw error
  }
}

export async function mcp__context7__resolve_library_id(params: MCPContext7ResolveLibraryParams) {
  try {
    // Try to use the actual MCP function if available
    if (typeof globalThis !== 'undefined' && 'mcp__context7__resolve_library_id' in globalThis) {
      // @ts-ignore - MCP function is available in server context
      return await globalThis.mcp__context7__resolve_library_id(params)
    }

    // In a real implementation, this would call Context7 MCP service
    // For now, return mock data structure
    console.warn('Context7 MCP tools not available, using fallback');
    return null;
  } catch (error) {
    console.error('MCP Context7 resolve library error:', error)
    throw error
  }
}

export async function mcp__context7__get_library_docs(params: MCPContext7GetLibraryDocsParams) {
  try {
    // Try to use the actual MCP function if available
    if (typeof globalThis !== 'undefined' && 'mcp__context7__get_library_docs' in globalThis) {
      // @ts-ignore - MCP function is available in server context
      return await globalThis.mcp__context7__get_library_docs(params)
    }

    // In a real implementation, this would call Context7 MCP service
    // For now, return mock data structure
    console.warn('Context7 MCP tools not available, using fallback');
    return null;
  } catch (error) {
    console.error('MCP Context7 get library docs error:', error)
    throw error
  }
}