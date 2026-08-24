import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params;
  
  const { data: recipe } = await supabase
    .from("recipes")
    .select(`*, product:products(name), unit:units(name, short_name)`)
    .eq("id", id)
    .single();
    
  if (!recipe) notFound();

  const { data: items } = await supabase
    .from("recipe_items")
    .select(`*, raw_material:raw_materials(name, purchase_price), unit:units(name, short_name)`)
    .eq("recipe_id", id);
    
  const { data: versions } = await supabase
    .from("recipes")
    .select("id, version, is_active, created_at")
    .eq("product_id", recipe.product_id)
    .order("version", { ascending: false });

  const totalCost = items?.reduce((sum, item) => sum + ((item.raw_material?.purchase_price || 0) * item.quantity), 0) || 0;
  const costPerUnit = totalCost / recipe.yield_quantity;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{recipe.name}</h2>
        <Badge variant={recipe.is_active ? "default" : "secondary"}>
          {recipe.is_active ? "Faol" : "Nofaol"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Retsept tarkibi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Xomashyo</TableHead>
                  <TableHead className="text-right">Miqdor</TableHead>
                  <TableHead>Birlik</TableHead>
                  <TableHead className="text-right">Narxi</TableHead>
                  <TableHead className="text-right">Jami</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.raw_material?.name}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
                    <TableCell>{item.unit?.short_name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.raw_material?.purchase_price || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency((item.raw_material?.purchase_price || 0) * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 flex justify-between items-center bg-muted p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Chiqish hajmi: {formatNumber(recipe.yield_quantity)} {recipe.unit?.short_name}</p>
                <p className="text-lg font-bold">Umumiy tannarx: {formatCurrency(totalCost)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Birlik tannarxi ({recipe.unit?.short_name})</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(costPerUnit)}</p>
              </div>
            </div>
            
            {recipe.instructions && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Ko'rsatmalar:</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{recipe.instructions}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Versiyalar tarixi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {versions?.map(v => (
                <div key={v.id} className={`flex justify-between items-center p-3 rounded-md border ${v.id === id ? 'bg-muted border-primary' : ''}`}>
                  <div>
                    <p className="font-medium">Versiya {v.version}</p>
                    <p className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={v.is_active ? "default" : "outline"}>
                    {v.is_active ? "Faol" : "Arxiv"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}