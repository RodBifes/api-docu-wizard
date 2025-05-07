
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Parameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface ApiResponseExample {
  code: number;
  body: string;
}

interface ApiEndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  title: string;
  description: string;
  parameters?: Parameter[];
  responses?: ApiResponseExample[];
  requestExample?: string;
}

const ApiEndpoint: React.FC<ApiEndpointProps> = ({
  method,
  endpoint,
  title,
  description,
  parameters = [],
  responses = [],
  requestExample,
}) => {
  const getMethodClass = () => {
    switch (method) {
      case "GET":
        return "method-get";
      case "POST":
        return "method-post";
      case "PUT":
        return "method-put";
      case "DELETE":
        return "method-delete";
      default:
        return "method-get";
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getMethodClass()}>{method}</Badge>
          <CardTitle className="text-xl font-mono">{endpoint}</CardTitle>
        </div>
        <h3 className="mt-2 text-lg font-medium">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">{description}</p>

        <Tabs defaultValue="parameters" className="mb-4">
          <TabsList>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="request">Request Example</TabsTrigger>
            <TabsTrigger value="response">Response Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters">
            {parameters.length > 0 ? (
              <div className="table-container">
                <table className="api-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parameters.map((param, index) => (
                      <tr key={index}>
                        <td className="font-mono">{param.name}</td>
                        <td className="font-mono text-xs">{param.type}</td>
                        <td>{param.required ? "Yes" : "No"}</td>
                        <td>{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No parameters required</p>
            )}
          </TabsContent>
          
          <TabsContent value="request">
            {requestExample ? (
              <pre className="code-block">{requestExample}</pre>
            ) : (
              <p className="text-muted-foreground">No request body required</p>
            )}
          </TabsContent>
          
          <TabsContent value="response">
            {responses.map((response, index) => (
              <div key={index} className="mb-4">
                <div className="flex gap-2 mb-2">
                  <Badge variant={response.code < 400 ? "outline" : "destructive"}>
                    {response.code}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {response.code < 300 
                      ? "Success" 
                      : response.code < 400 
                      ? "Redirection" 
                      : response.code < 500 
                      ? "Client Error" 
                      : "Server Error"}
                  </span>
                </div>
                <pre className="code-block">{response.body}</pre>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiEndpoint;
