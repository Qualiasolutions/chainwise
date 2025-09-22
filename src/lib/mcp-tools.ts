// MCP Tools Wrapper
// This file provides a simple wrapper around MCP tools

interface MCPExecuteSQLParams {
  project_id: string
  query: string
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