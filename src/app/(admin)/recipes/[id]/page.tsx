import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isRealSupabaseConfigured, INITIAL_PRODUCTS } from "@/lib/mock-data";

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let recipe: any = {
    id: id,
    name: "Klassik Samarqand Holvasi (Retsept #1)",
    yield_quantity: 100,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  let items: any[] = [
    { id: "1", raw_material: { name: "Shakar (Saxaroza)", purchase_price: 11000 }, quantity: 40, unit: { short_name: "kg" } },
    { id: "2", raw_material: { name: "Qandolat yog'i", purchase_price: 32000 }, quantity: 25, unit: { short_name: "kg" } },
    { id: "3", raw_material: { name: "Kungaboqar mag'zi", purchase_price: 24000 }, quantity: 30, unit: { short_name: "kg" } },
    { id: "4", raw_material: { name: "Yorongul ildizi ekstrakti", purchase_price: 85000 }, quantity: 5, unit: { short_name: "litr" } },
  ];

  if (isRealSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: dbRecipe } = await supabase
        .from("recipes")
        .select(`*, product:products(name), unit:units(name, short_name)`)
        .eq("id", id)
        .single();
        
      if (dbRecipe) recipe = dbRecipe;

      const { data: dbItems } = await supabase
        .from("recipe_items")
        .select(`*, raw_material:raw_materials(name, purchase_price), unit:units(name, short_name)`)
        .eq("recipe_id", id);
      if (dbItems) items = dbItems;
    } catch {
      // Fallback
    }
  }

  const totalCost = items.reduce((sum: number, item: any) => sum + ((item.raw_material?.purchase_price || 0) * item.quantity), 0) || 0;
  const costPerUnit = totalCost / (recipe.yield_quantity || 100);

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
                {items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.raw_material?.name}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
                    <TableCell>{item.unit?.short_name || 'kg'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.raw_material?.purchase_price || 0)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency((item.raw_material?.purchase_price || 0) * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tannarx tahlili</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Chiqish hajmi</div>
                <div className="text-2xl font-bold">{formatNumber(recipe.yield_quantity || 100)} kg</div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">Jami xomashyo tannarxi</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">1 kg mahsulot tannarxi</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(costPerUnit)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}