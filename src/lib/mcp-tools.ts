// MCP Tools Wrapper
// This file provides a simple wrapper around MCP tools

interface MCPExecuteSQLParams {
  project_id: string
  query: string
}

export async function mcp__supabase__execute_sql(params: MCPExecuteSQLParams) {
  // For client-side execution, we need to call an API route
  // that will handle the database operations
  const response = await fetch('/api/database/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message || 'Database query failed')
  }

  return data.result
}