
interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

interface Endpoint {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  title: string;
  description: string;
  requiresAuth: boolean;
  parameters: Parameter[];
  responseExample: string;
}

interface ApiDocumentation {
  apiName: string;
  baseUrl: string;
  description: string;
  version: string;
  endpoints: Endpoint[];
}

/**
 * Processes an OpenAPI specification and converts it to our application's format
 */
export const processOpenApiSpec = (spec: any): ApiDocumentation => {
  // Extract basic information
  const apiName = spec.info?.title || "API Documentation";
  const description = spec.info?.description || "";
  const version = spec.info?.version || "1.0.0";
  const baseUrl = spec.servers && spec.servers.length > 0 ? spec.servers[0].url : "";
  
  // Process endpoints
  const endpoints: Endpoint[] = [];
  
  // Process paths
  if (spec.paths) {
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      // Process each method (GET, POST, etc.)
      for (const [method, operation] of Object.entries(pathItem as any)) {
        // Only process supported methods
        if (!["get", "post", "put", "delete"].includes(method.toLowerCase())) {
          continue;
        }
        
        const methodUpperCase = method.toUpperCase() as "GET" | "POST" | "PUT" | "DELETE";
        
        const endpoint: Endpoint = {
          method: methodUpperCase,
          path: path,
          title: (operation as any).summary || `${methodUpperCase} ${path}`,
          description: (operation as any).description || "",
          requiresAuth: false, // Default value, we'll check security below
          parameters: [],
          responseExample: "",
        };
        
        // Check if endpoint requires authentication
        if ((operation as any).security && (operation as any).security.length > 0) {
          endpoint.requiresAuth = true;
        }
        
        // Process parameters
        const parameters = [...((operation as any).parameters || [])];
        
        // Add request body parameters for POST, PUT methods
        if ((operation as any).requestBody && ["POST", "PUT"].includes(methodUpperCase)) {
          const requestBody = (operation as any).requestBody;
          const contentType = requestBody.content && 
            Object.keys(requestBody.content).find(type => 
              type.includes("json") || type.includes("x-www-form-urlencoded")
            );
          
          if (contentType && requestBody.content[contentType].schema) {
            const schema = requestBody.content[contentType].schema;
            if (schema.properties) {
              for (const [propName, propSchema] of Object.entries(schema.properties)) {
                parameters.push({
                  name: propName,
                  in: "body",
                  required: schema.required && schema.required.includes(propName),
                  schema: propSchema,
                  description: (propSchema as any).description || "",
                });
              }
            }
          }
        }
        
        // Process parameters
        endpoint.parameters = parameters.map(param => ({
          name: param.name,
          type: getParameterType(param),
          description: param.description || "",
          required: param.required || false,
        }));
        
        // Generate response example
        endpoint.responseExample = generateResponseExample(operation as any);
        
        endpoints.push(endpoint);
      }
    }
  }
  
  return {
    apiName,
    baseUrl,
    description,
    version,
    endpoints,
  };
};

/**
 * Determines the type of a parameter
 */
function getParameterType(param: any): string {
  if (param.schema) {
    const schema = param.schema;
    if (schema.type) {
      if (schema.type === "array" && schema.items && schema.items.type) {
        return `array[${schema.items.type}]`;
      }
      return schema.type;
    }
  }
  if (param.type) {
    return param.type;
  }
  return "object";
}

/**
 * Generates a response example based on the operation responses
 */
function generateResponseExample(operation: any): string {
  if (!operation.responses) return "";
  
  // Look for success responses (200, 201, etc.)
  const successResponseCodes = ["200", "201", "202", "203", "204", "206"];
  let responseCode = successResponseCodes.find(code => operation.responses[code]);
  
  // If no success response found, use the first available
  if (!responseCode) {
    responseCode = Object.keys(operation.responses)[0];
  }
  
  if (!responseCode) return "";
  
  const response = operation.responses[responseCode];
  
  // Get content from response
  if (response.content) {
    const contentType = Object.keys(response.content).find(type => 
      type.includes("json") || type.includes("application/json")
    );
    
    if (contentType && response.content[contentType].example) {
      return JSON.stringify(response.content[contentType].example, null, 2);
    }
    
    if (contentType && response.content[contentType].schema) {
      // Generate example from schema
      const schema = response.content[contentType].schema;
      const example = generateExampleFromSchema(schema);
      return JSON.stringify(example, null, 2);
    }
  }
  
  return "";
}

/**
 * Generates an example object from a schema
 */
function generateExampleFromSchema(schema: any): any {
  if (!schema) return {};
  
  // Handle reference
  if (schema.$ref) {
    // For simplicity in this implementation, we return a placeholder
    return { "_example": "Referenced type" };
  }
  
  // Handle different types
  switch (schema.type) {
    case "object":
      if (schema.properties) {
        const result: any = {};
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          result[propName] = generateExampleFromSchema(propSchema as any);
        }
        return result;
      }
      return {};
      
    case "array":
      if (schema.items) {
        return [generateExampleFromSchema(schema.items)];
      }
      return [];
      
    case "string":
      return schema.example || schema.default || "string";
      
    case "number":
    case "integer":
      return schema.example || schema.default || 0;
      
    case "boolean":
      return schema.example || schema.default || false;
      
    default:
      return schema.example || schema.default || null;
  }
}
