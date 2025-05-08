import { ApiDocumentation, Endpoint, Parameter } from "@/lib/openapi-parser";

/**
 * Generates HTML documentation from the API documentation data
 */
export const generateHtmlDocumentation = (data: ApiDocumentation): string => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.apiName} Documentation</title>
  <style>
    :root {
      --primary: #0f172a;
      --secondary: #1e293b;
      --accent: #3b82f6;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #334155;
      --radius: 0.5rem;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: var(--text);
      background-color: var(--primary);
      padding: 2rem;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    header {
      margin-bottom: 2rem;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    
    .version {
      color: var(--muted);
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    
    .base-url {
      background-color: var(--secondary);
      padding: 1rem;
      border-radius: var(--radius);
      font-family: monospace;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
    
    .description {
      margin-bottom: 2rem;
      color: var(--muted);
    }
    
    .endpoints {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    
    .endpoint {
      background-color: var(--secondary);
      border-radius: var(--radius);
      overflow: hidden;
    }
    
    .endpoint-header {
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid var(--border);
    }
    
    .method {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius);
      font-weight: bold;
      font-size: 0.875rem;
      min-width: 60px;
      text-align: center;
    }
    
    .method.get {
      background-color: #10b981;
      color: #064e3b;
    }
    
    .method.post {
      background-color: #3b82f6;
      color: #1e3a8a;
    }
    
    .method.put {
      background-color: #f59e0b;
      color: #78350f;
    }
    
    .method.delete {
      background-color: #ef4444;
      color: #7f1d1d;
    }
    
    .path {
      font-family: monospace;
      font-size: 1rem;
    }
    
    .endpoint-content {
      padding: 1rem;
    }
    
    .endpoint-title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
    
    .endpoint-description {
      color: var(--muted);
      margin-bottom: 1rem;
    }
    
    .auth-required {
      display: inline-block;
      background-color: var(--border);
      color: var(--text);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius);
      font-size: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .parameters-title, .response-title {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
      margin-top: 1rem;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
      table-layout: fixed;
    }
    
    th, td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
      overflow-wrap: break-word;
    }
    
    th {
      color: var(--muted);
      font-weight: normal;
    }
    
    .required {
      color: #ef4444;
    }
    
    .response-example {
      background-color: var(--primary);
      padding: 1rem;
      border-radius: var(--radius);
      font-family: monospace;
      white-space: pre-wrap;
      overflow-x: auto;
    }
    
    footer {
      margin-top: 3rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      
      .endpoint-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    
    /* Add anchor link styles */
    .endpoint-anchor {
      scroll-margin-top: 2rem;
    }
    
    /* Improve table styling */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
      table-layout: fixed;
    }
    
    th, td {
      text-align: left;
      padding: 0.75rem;
      border-bottom: 1px solid var(--border);
      overflow-wrap: break-word;
    }
    
    /* Add table of contents styles */
    .toc {
      background-color: var(--secondary);
      padding: 1rem;
      border-radius: var(--radius);
      margin-bottom: 2rem;
    }
    
    .toc-title {
      margin-bottom: 0.5rem;
    }
    
    .toc-list {
      list-style: none;
      padding-left: 0;
    }
    
    .toc-item {
      margin-bottom: 0.25rem;
    }
    
    .toc-link {
      color: var(--accent);
      text-decoration: none;
    }
    
    .toc-link:hover {
      text-decoration: underline;
    }
    
    .method-tag {
      display: inline-block;
      width: 60px;
      text-align: center;
      padding: 2px 4px;
      border-radius: var(--radius);
      font-weight: bold;
      font-size: 0.75rem;
      margin-right: 0.5rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${data.apiName}</h1>
      <div class="version">Version: ${data.version}</div>
      <div class="base-url">${data.baseUrl}</div>
      <div class="description">${data.description || 'No description provided.'}</div>
    </header>
    
    <!-- Table of Contents -->
    <div class="toc">
      <h2 class="toc-title">API Endpoints</h2>
      <ul class="toc-list">
        ${data.endpoints.map((endpoint, index) => `
          <li class="toc-item">
            <a href="#endpoint-${index}" class="toc-link">
              <span class="method-tag ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
              ${endpoint.path} - ${endpoint.title}
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
    
    <div class="endpoints">
      ${data.endpoints.length > 0 
        ? data.endpoints.map((endpoint, index) => renderEndpoint(endpoint, index)).join('\n')
        : '<div class="no-endpoints">No endpoints defined.</div>'}
    </div>
    
    <footer>
      <p>Generated on ${new Date().toLocaleDateString()} using API Documentation Generator</p>
    </footer>
  </div>
</body>
</html>
  `;
  
  return html;
};

/**
 * Renders an endpoint as HTML
 */
const renderEndpoint = (endpoint: Endpoint, index: number): string => {
  const methodClass = endpoint.method.toLowerCase();
  
  return `
    <div id="endpoint-${index}" class="endpoint endpoint-anchor">
      <div class="endpoint-header">
        <div class="method ${methodClass}">${endpoint.method}</div>
        <div class="path">${endpoint.path}</div>
      </div>
      <div class="endpoint-content">
        <h2 class="endpoint-title">${endpoint.title || 'Untitled Endpoint'}</h2>
        <div class="endpoint-description">${endpoint.description || 'No description available.'}</div>
        
        ${endpoint.requiresAuth ? '<div class="auth-required">Requires Authentication</div>' : ''}
        
        ${endpoint.parameters && endpoint.parameters.length > 0 ? `
          <h3 class="parameters-title">Parameters</h3>
          <table>
            <thead>
              <tr>
                <th width="20%">Name</th>
                <th width="15%">Type</th>
                <th width="15%">Required</th>
                <th width="50%">Description</th>
              </tr>
            </thead>
            <tbody>
              ${endpoint.parameters.map(param => renderParameter(param)).join('')}
            </tbody>
          </table>
        ` : '<p>No parameters required.</p>'}
        
        ${endpoint.responseExample ? `
          <h3 class="response-title">Response Example</h3>
          <pre class="response-example">${formatJson(endpoint.responseExample)}</pre>
        ` : '<p>No response example available.</p>'}
      </div>
    </div>
  `;
};

/**
 * Renders a parameter as HTML table row
 */
const renderParameter = (param: Parameter): string => {
  return `
    <tr>
      <td><strong>${param.name || ''}</strong></td>
      <td><code>${param.type || 'string'}</code></td>
      <td>${param.required ? '<span class="required">Required</span>' : 'Optional'}</td>
      <td>${param.description || 'No description available.'}</td>
    </tr>
  `;
};

/**
 * Formats JSON string for display
 */
const formatJson = (jsonString: string): string => {
  try {
    // Try to parse JSON string
    const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // If parsing fails, just return the original string with escaping
    return jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
