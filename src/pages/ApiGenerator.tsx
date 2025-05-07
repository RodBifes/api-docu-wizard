
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

type FormValues = z.infer<typeof formSchema>;

const ApiGenerator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [endpointCount, setEndpointCount] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();

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
                    
                    <Button type="submit" className="w-full">Generate Documentation</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApiGenerator;
