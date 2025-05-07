
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Loader, 
  Globe,
  ShieldAlert,
  InfoIcon 
} from "lucide-react";
import { processOpenApiSpec } from "@/lib/openapi-parser";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Form schema
const formSchema = z.object({
  apiName: z.string().min(1, "API name is required"),
  baseUrl: z.string().min(1, "Base URL is required"),
  description: z.string().min(1, "Description is required"),
  version: z.string().min(1, "Version is required"),
  endpoints: z.array(
    z.object({
      method: z.enum(["GET", "POST", "PUT", "DELETE"]),
      path: z.string().min(1, "Endpoint path is required"),
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      requiresAuth: z.boolean().default(false),
      parameters: z.array(
        z.object({
          name: z.string().min(1, "Parameter name is required"),
          type: z.string().min(1, "Parameter type is required"),
          description: z.string().min(1, "Description is required"),
          required: z.boolean().default(false),
        })
      ).default([]),
      responseExample: z.string().optional(),
    })
  ).default([]),
});

// URL Input schema
const urlSchema = z.object({
  apiUrl: z.string().url("Please enter a valid URL"),
});

type FormValues = z.infer<typeof formSchema>;
type UrlFormValues = z.infer<typeof urlSchema>;

const ApiGenerator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [endpointCount, setEndpointCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form for manual input
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiName: "",
      baseUrl: "",
      description: "",
      version: "v1.0",
      endpoints: [
        {
          method: "GET",
          path: "/",
          title: "",
          description: "",
          requiresAuth: false,
          parameters: [],
          responseExample: "",
        },
      ],
    },
  });

  // Form for URL input
  const urlForm = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      apiUrl: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form data:", data);
    toast({
      title: "API Documentation Generated",
      description: "Your API documentation has been generated successfully.",
    });
    
    // In a real app, you would likely use a context or state management 
    // to pass the data to the documentation page
    // For now, we'll just navigate to the main page
    navigate("/");
  };

  const fetchApiDoc = async (data: UrlFormValues) => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    
    try {
      console.log("Fetching API specification from:", data.apiUrl);
      
      // Updated Petstore URL to a working version
      if (data.apiUrl.includes("petstore.json")) {
        // Use a known working version of the petstore spec
        data.apiUrl = "https://petstore3.swagger.io/api/v3/openapi.json";
      }
      
      // Check if the URL is a GitHub URL without raw content
      const url = data.apiUrl.trim();
      let fetchUrl = url;
      
      if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
        // Convert regular GitHub URL to raw content URL
        fetchUrl = url
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
        console.log("Converted GitHub URL to raw content URL:", fetchUrl);
      }
      
      // Add multiple CORS proxies for fallback
      const corsProxies = [
        '', // Try direct first
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://proxy.cors.sh/'
      ];
      
      let response: Response | null = null;
      let proxyUsed = false;
      let error: Error | null = null;
      let responseText: string | null = null;
      
      // Try each proxy until one works
      for (const proxy of corsProxies) {
        try {
          const proxyUrl = proxy ? `${proxy}${encodeURIComponent(fetchUrl)}` : fetchUrl;
          console.log(`Attempting fetch with ${proxy ? 'proxy: ' + proxy : 'direct fetch'}`);
          
          response = await fetch(proxyUrl, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          });
          
          if (response.ok) {
            responseText = await response.text();
            // Try parsing to validate it's JSON before proceeding
            JSON.parse(responseText);
            proxyUsed = !!proxy;
            console.log(`Successful fetch with ${proxyUsed ? 'proxy' : 'direct request'}`);
            break;
          }
        } catch (err) {
          console.log(`Fetch attempt failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
          error = err instanceof Error ? err : new Error('Unknown fetch error');
          // Continue to next proxy
        }
      }
      
      if (!response || !response.ok || !responseText) {
        throw new Error(
          `Failed to fetch API specification: ${
            error?.message || 'Network error'
          }. This could be due to CORS restrictions or the URL being inaccessible.`
        );
      }
      
      // Parse JSON response
      let apiSpec;
      try {
        apiSpec = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON parsing error:", e);
        throw new Error("Unable to parse API specification: Not a valid JSON");
      }
      
      // Process the API specification
      console.log("Fetched API spec:", apiSpec);
      
      // Check if it's an OpenAPI specification
      if (apiSpec.openapi || apiSpec.swagger) {
        // Process OpenAPI spec and convert to our format
        const processedData = processOpenApiSpec(apiSpec);
        
        // Set the form values
        form.reset(processedData);
        
        toast({
          title: "API Specification Imported",
          description: `The API specification '${processedData.apiName}' has been successfully imported. Review and customize as needed.`,
          variant: "success"
        });
        
        // Switch to the manual tab to show the imported data
        document.querySelector('[data-state="inactive"][value="manual"]')?.dispatchEvent(
          new MouseEvent('click', { bubbles: true })
        );
      } else {
        throw new Error("Unsupported API specification format. Only OpenAPI/Swagger is currently supported.");
      }
    } catch (err) {
      console.error("Error fetching API spec:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      setErrorDetails(err instanceof Error ? err.stack || "" : JSON.stringify(err, null, 2));
      toast({
        variant: "destructive",
        title: "Error Importing API",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addEndpoint = () => {
    const currentEndpoints = form.getValues("endpoints");
    form.setValue("endpoints", [
      ...currentEndpoints,
      {
        method: "GET",
        path: "/",
        title: "",
        description: "",
        requiresAuth: false,
        parameters: [],
        responseExample: "",
      },
    ]);
    setEndpointCount(endpointCount + 1);
  };

  const addParameter = (endpointIndex: number) => {
    const currentEndpoints = form.getValues("endpoints");
    const updatedEndpoints = [...currentEndpoints];
    
    if (!updatedEndpoints[endpointIndex].parameters) {
      updatedEndpoints[endpointIndex].parameters = [];
    }
    
    updatedEndpoints[endpointIndex].parameters.push({
      name: "",
      type: "string",
      description: "",
      required: false,
    });
    
    form.setValue("endpoints", updatedEndpoints);
  };

  return (
    <div className="flex min-h-screen flex-col dark">
      <Navbar />
      <div className="flex flex-1">
        <div
          className={`${
            sidebarOpen ? "w-64 block" : "w-0 hidden"
          } transition-all duration-200 ease-in-out`}
        >
          <Sidebar className="h-[calc(100vh-4rem)]" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed left-3 top-20 md:hidden"
        >
          {sidebarOpen ? "←" : "→"}
        </Button>
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Generate API Documentation</h1>
            
            <Tabs defaultValue="url" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">Import from URL</TabsTrigger>
                <TabsTrigger value="manual">Create Manually</TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Import API from URL</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...urlForm}>
                      <form onSubmit={urlForm.handleSubmit(fetchApiDoc)} className="space-y-6">
                        <FormField
                          control={urlForm.control}
                          name="apiUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Specification URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://petstore3.swagger.io/api/v3/openapi.json"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter the URL of an OpenAPI/Swagger specification file. You can use GitHub URLs too.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Petstore Example Button with updated URL */}
                        <div className="flex justify-center mb-4">
                          <Button 
                            variant="outline" 
                            type="button"
                            className="flex items-center gap-2"
                            onClick={() => {
                              urlForm.setValue("apiUrl", "https://petstore3.swagger.io/api/v3/openapi.json");
                            }}
                          >
                            <Globe className="h-4 w-4" />
                            Use Petstore Example URL
                          </Button>
                        </div>
                        
                        {error && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription className="space-y-2">
                              <p>{error}</p>
                              {error.includes("CORS") || error.includes("Failed to fetch") ? (
                                <div className="mt-2 text-sm">
                                  <p className="font-medium">Troubleshooting tips:</p>
                                  <ul className="list-disc pl-5 mt-1 space-y-1">
                                    <li>Try a public API specification URL like from <a href="https://github.com/OAI/OpenAPI-Specification/tree/main/examples/v3.0" target="_blank" rel="noopener noreferrer" className="underline">OpenAPI examples</a></li>
                                    <li>Make sure the URL is accessible publicly</li>
                                    <li>For GitHub repositories, use raw file URLs</li>
                                  </ul>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-2" 
                                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                                  >
                                    {showErrorDetails ? "Hide" : "Show"} Technical Details
                                  </Button>
                                </div>
                              ) : null}
                              
                              {showErrorDetails && errorDetails && (
                                <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto max-h-40">
                                  {errorDetails}
                                </pre>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <Alert variant="info" className="mt-4">
                          <InfoIcon className="h-4 w-4" />
                          <AlertTitle>Supported Formats</AlertTitle>
                          <AlertDescription>
                            Currently supports OpenAPI/Swagger specification formats. The URL must point to a JSON file that's publicly accessible.
                          </AlertDescription>
                        </Alert>
                        
                        <Button type="submit" disabled={isLoading} className="w-full">
                          {isLoading ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" /> Importing...
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2 h-4 w-4" /> Import API Documentation
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="manual" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>API Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="apiName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>API Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Products API" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="version"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Version</FormLabel>
                                <FormControl>
                                  <Input placeholder="v1.0" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="baseUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://api.example.com/v1" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="This API provides endpoints to manage products..." 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="space-y-8">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Endpoints</h3>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={addEndpoint}
                            >
                              Add Endpoint
                            </Button>
                          </div>
                          
                          {Array.from({ length: endpointCount }).map((_, index) => (
                            <Card key={index} className="border border-border p-4">
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name={`endpoints.${index}.method`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Method</FormLabel>
                                        <FormControl>
                                          <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                            value={field.value}
                                            onChange={field.onChange}
                                          >
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                          </select>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name={`endpoints.${index}.path`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Path</FormLabel>
                                        <FormControl>
                                          <Input placeholder="/products" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name={`endpoints.${index}.title`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Title</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Get All Products" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`endpoints.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Description</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Returns a list of all products" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`endpoints.${index}.requiresAuth`}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Requires Authentication</FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                                
                                <div>
                                  <div className="flex justify-between items-center mb-3">
                                    <FormLabel>Parameters</FormLabel>
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => addParameter(index)}
                                    >
                                      Add Parameter
                                    </Button>
                                  </div>
                                  
                                  {form.getValues(`endpoints.${index}.parameters`)?.map((_, paramIndex) => (
                                    <div key={paramIndex} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                                      <FormField
                                        control={form.control}
                                        name={`endpoints.${index}.parameters.${paramIndex}.name`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input placeholder="Name" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`endpoints.${index}.parameters.${paramIndex}.type`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input placeholder="Type" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`endpoints.${index}.parameters.${paramIndex}.description`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input placeholder="Description" {...field} />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name={`endpoints.${index}.parameters.${paramIndex}.required`}
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel>Required</FormLabel>
                                            </div>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  ))}
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name={`endpoints.${index}.responseExample`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Response Example (JSON)</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder='{
  "products": [
    {
      "id": "123",
      "name": "Product Name"
    }
  ]
}'
                                          className="min-h-[150px] font-mono"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </Card>
                          ))}
                        </div>
                        
                        <Button type="submit" className="w-full">
                          <ArrowRight className="mr-2 h-4 w-4" /> Generate Documentation
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Error details dialog */}
      <Dialog open={showErrorDetails} onOpenChange={setShowErrorDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
            <DialogDescription>
              Technical information about the error that occurred.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <pre className="p-4 bg-black/20 rounded text-xs overflow-auto max-h-80">
              {errorDetails || "No additional details available"}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiGenerator;
