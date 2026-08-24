"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, User, Shield, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const companySchema = z.object({
  name: z.string().min(1, "Nomi kiritilishi shart"),
  address: z.string().optional(),
  phone: z.string().optional(),
  telegram: z.string().optional(),
  currency: z.string().default("UZS")
});

const profileSchema = z.object({
  full_name: z.string().min(1, "Ism kiritilishi shart"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  new_password: z.string().min(6, "Parol kamida 6 ta belgi bo'lishi kerak"),
  confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
  message: "Parollar mos kelmadi",
  path: ["confirm_password"]
});

export function SettingsClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [factory, setFactory] = useState<any>(null);

  // Fetch initial data manually since we need to seed the forms properly
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setUserProfile(profile);
      
      if (profile?.factory_id) {
        const { data: fact } = await supabase.from("factories").select("*").eq("id", profile.factory_id).single();
        setFactory(fact);
        companyForm.reset({
          name: fact?.name || "",
          address: fact?.address || "",
          phone: fact?.phone || "",
          telegram: fact?.telegram || "",
          currency: (fact?.settings as any)?.currency || "UZS"
        });
        setNotifications((fact?.settings as any)?.notifications || { low_stock: true, new_order: true });
      }
      
      profileForm.reset({
        full_name: profile?.full_name || "",
        phone: profile?.phone || ""
      });
    }
    loadData();
  }, []);

  const companyForm = useForm<z.infer<typeof companySchema>>({ resolver: zodResolver(companySchema) as any });
  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  const [notifications, setNotifications] = useState({ low_stock: true, new_order: true });

  const updateCompanyMutation = useMutation({
    mutationFn: async (values: z.infer<typeof companySchema>) => {
      if (!factory) return;
      const settings = { ...(factory.settings as any), currency: values.currency, notifications };
      const { error } = await supabase.from("factories").update({
        name: values.name,
        address: values.address,
        phone: values.phone,
        telegram: values.telegram,
        settings
      }).eq("id", factory.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Kompaniya sozlamalari saqlandi"),
    onError: (e: any) => toast.error(e.message)
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      if (!userProfile) return;
      const { error } = await supabase.from("profiles").update({
        full_name: values.full_name,
        phone: values.phone
      }).eq("id", userProfile.id);
      if (error) throw error;
    },
    onSuccess: () => toast.success("Profil yangilandi"),
    onError: (e: any) => toast.error(e.message)
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (values: z.infer<typeof passwordSchema>) => {
      const { error } = await supabase.auth.updateUser({ password: values.new_password });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Parol yangilandi");
      passwordForm.reset();
    },
    onError: (e: any) => toast.error(e.message)
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !factory) return;
    const file = e.target.files[0];
    const path = `logos/${factory.id}-${Date.now()}`;
    
    toast.promise(
      supabase.storage.from("factory-assets").upload(path, file).then(async ({ data, error }) => {
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from("factory-assets").getPublicUrl(path);
        await supabase.from("factories").update({ logo_url: publicUrl }).eq("id", factory.id);
        setFactory({ ...factory, logo_url: publicUrl });
      }),
      { loading: "Yuklanmoqda...", success: "Logotip yangilandi", error: "Xatolik yuz berdi" }
    );
  };

  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2"/> Kompaniya</TabsTrigger>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2"/> Profil</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2"/> Xavfsizlik</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2"/> Bildirishnomalar</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Kompaniya ma'lumotlari</CardTitle>
              <CardDescription>Zavod yoki kompaniya haqida asosiy ma'lumotlar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center gap-4">
                <Avatar className="w-20 h-20 border">
                  <AvatarImage src={factory?.logo_url || ""} />
                  <AvatarFallback><Building2 className="w-8 h-8 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
                      Logotip yuklash
                    </div>
                  </Label>
                  <Input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <p className="text-xs text-muted-foreground mt-2">Tavsiya etilgan o'lcham: 256x256px</p>
                </div>
              </div>

              <form onSubmit={companyForm.handleSubmit(((d: any) => updateCompanyMutation.mutate(d)) as any)} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label>Kompaniya nomi</Label>
                  <Input {...companyForm.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label>Manzil</Label>
                  <Input {...companyForm.register("address")} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input {...companyForm.register("phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telegram</Label>
                    <Input {...companyForm.register("telegram")} placeholder="@username" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Asosiy valyuta</Label>
                  <Select 
                    value={companyForm.watch("currency")} 
                    onValueChange={(v) => companyForm.setValue("currency", v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UZS">UZS - So'm</SelectItem>
                      <SelectItem value="USD">USD - AQSh dollari</SelectItem>
                      <SelectItem value="EUR">EUR - Yevro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={updateCompanyMutation.isPending}>Saqlash</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Shaxsiy profil</CardTitle>
              <CardDescription>O'z ma'lumotlaringizni tahrirlang</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit((d) => updateProfileMutation.mutate(d))} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label>Email (faqat o'qish uchun)</Label>
                  <Input value={userProfile?.email || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Rol (faqat o'qish uchun)</Label>
                  <Input value={userProfile?.role || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>F.I.SH.</Label>
                  <Input {...profileForm.register("full_name")} />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input {...profileForm.register("phone")} />
                </div>
                <Button type="submit" disabled={updateProfileMutation.isPending}>Saqlash</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Parolni o'zgartirish</CardTitle>
              <CardDescription>Tizimga kirish parolini yangilang</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit((d) => updatePasswordMutation.mutate(d))} className="space-y-4 max-w-xl">
                <div className="space-y-2">
                  <Label>Yangi parol</Label>
                  <Input type="password" {...passwordForm.register("new_password")} />
                  {passwordForm.formState.errors.new_password && (
                    <span className="text-xs text-destructive">{passwordForm.formState.errors.new_password.message}</span>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Parolni tasdiqlang</Label>
                  <Input type="password" {...passwordForm.register("confirm_password")} />
                  {passwordForm.formState.errors.confirm_password && (
                    <span className="text-xs text-destructive">{passwordForm.formState.errors.confirm_password.message}</span>
                  )}
                </div>
                <Button type="submit" disabled={updatePasswordMutation.isPending}>Parolni yangilash</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirishnomalar</CardTitle>
              <CardDescription>Qaysi holatlarda xabar olishni sozlang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Omborda zaxira kamayganda</Label>
                  <p className="text-sm text-muted-foreground">Minimal miqdordan kamaygan mahsulotlar bo'yicha ogohlantirish</p>
                </div>
                <Switch 
                  checked={notifications.low_stock} 
                  onCheckedChange={(c) => {
                    setNotifications(prev => ({...prev, low_stock: c}));
                    if(factory) {
                      const newSet = { ...(factory.settings as any), notifications: { ...notifications, low_stock: c } };
                      supabase.from("factories").update({ settings: newSet }).eq("id", factory.id);
                    }
                  }} 
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Yangi buyurtma tushganda</Label>
                  <p className="text-sm text-muted-foreground">Mijozlardan yangi buyurtma kelganda</p>
                </div>
                <Switch 
                  checked={notifications.new_order} 
                  onCheckedChange={(c) => {
                    setNotifications(prev => ({...prev, new_order: c}));
                    if(factory) {
                      const newSet = { ...(factory.settings as any), notifications: { ...notifications, new_order: c } };
                      supabase.from("factories").update({ settings: newSet }).eq("id", factory.id);
                    }
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}