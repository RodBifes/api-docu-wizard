
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ApiEndpoint from "@/components/ApiEndpoint";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-4">GET /products</h1>
              <div className="flex gap-2 mb-6">
                <Badge variant="outline">v1.2</Badge>
                <Badge variant="outline">Products</Badge>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Products</h2>
                <p className="text-muted-foreground mb-4">
                  The <span className="font-semibold">Products</span> endpoint returns information about the products offered at a given location. 
                  The response includes the display name and other details about each product, and lists the products in the proper display order. 
                  Some products, such as Eats, are not returned by this endpoint.
                </p>

                <p className="text-muted-foreground mb-4">
                  This endpoint does not reflect real-time availability of the products. Please use the 
                  <span className="font-semibold text-blue-500"> Time Estimates </span>
                  endpoint to determine real-time availability and ETAs of products.
                </p>

                <p className="text-muted-foreground">
                  In some markets, the list of products returned from this endpoint may vary by the time of day due to time restrictions on when that product may be utilized.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Resource</h2>
                <pre className="code-block">GET /v1.2/products</pre>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Authorization</h2>
                <p className="mb-2">
                  <Button variant="link" className="px-0 text-blue-500">Server token</Button>
                  {" "}or OAuth 2.0 {" "}
                  <Button variant="link" className="px-0 text-blue-500">user access token</Button>
                  {" "}with any valid scope.
                </p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Query parameters</h2>
                
                <div className="table-container">
                  <table className="api-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono">latitude</td>
                        <td className="font-mono text-xs">number</td>
                        <td>Latitude component of location.</td>
                      </tr>
                      <tr>
                        <td className="font-mono">longitude</td>
                        <td className="font-mono text-xs">number</td>
                        <td>Longitude component of location.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Example request</h2>
                <pre className="code-block">
{`curl -X GET \\
  'https://api.example.com/v1.2/products?latitude=37.7759792&longitude=-122.41823' \\
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'`}
                </pre>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Example response</h2>
                <pre className="code-block">
{`{
  "products": [
    {
      "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
      "display_name": "Standard",
      "description": "A low cost ride",
      "capacity": 4,
      "image": "https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-standard.png"
    },
    {
      "product_id": "b5921e7a-f9ee-4c25-b46a-1882979e1a0c",
      "display_name": "Premium",
      "description": "A premium ride option",
      "capacity": 4,
      "image": "https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-premium.png"
    }
  ]
}`}
                </pre>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Other endpoints</h2>
                
                <ApiEndpoint 
                  method="GET"
                  endpoint="/v1.2/products/{product_id}"
                  title="Get Product Details"
                  description="Returns information about a specific product."
                  parameters={[
                    {
                      name: "product_id",
                      type: "string",
                      description: "Unique identifier representing a specific product",
                      required: true,
                    }
                  ]}
                  responses={[
                    {
                      code: 200,
                      body: `{
  "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
  "display_name": "Standard",
  "description": "A low cost ride",
  "capacity": 4,
  "image": "https://d1a3f4spazzrp4.cloudfront.net/car-types/mono/mono-standard.png"
}`
                    },
                    {
                      code: 404,
                      body: `{
  "error": "product_not_found",
  "message": "The specified product was not found"
}`
                    }
                  ]}
                />

                <ApiEndpoint 
                  method="POST"
                  endpoint="/v1.2/products/estimates"
                  title="Get Price Estimates"
                  description="Returns an estimated price range for each product offered between the start and end locations."
                  parameters={[
                    {
                      name: "start_latitude",
                      type: "number",
                      description: "Latitude component of start location.",
                      required: true,
                    },
                    {
                      name: "start_longitude",
                      type: "number",
                      description: "Longitude component of start location.",
                      required: true,
                    },
                    {
                      name: "end_latitude",
                      type: "number",
                      description: "Latitude component of end location.",
                      required: true,
                    },
                    {
                      name: "end_longitude",
                      type: "number",
                      description: "Longitude component of end location.",
                      required: true,
                    }
                  ]}
                  requestExample={`{
  "start_latitude": 37.7759792,
  "start_longitude": -122.41823,
  "end_latitude": 37.7924,
  "end_longitude": -122.3998
}`}
                  responses={[
                    {
                      code: 200,
                      body: `{
  "price_estimates": [
    {
      "product_id": "a1111c8c-c720-46c3-8534-2fcdd730040d",
      "currency_code": "USD",
      "display_name": "Standard",
      "estimate": "$10-15",
      "low_estimate": 10,
      "high_estimate": 15,
      "surge_multiplier": 1
    }
  ]
}`
                    }
                  ]}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
