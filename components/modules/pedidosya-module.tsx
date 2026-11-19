"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import * as XLSX from "xlsx"
import {
  FileSpreadsheet,
  Upload,
  DollarSign,
  Building2,
  TrendingUp,
  Percent,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Printer,
  ChevronDown,
  Sparkles,
  ClipboardPaste,
  ShieldCheck,
  Tag,
  Calendar,
  AlertTriangle,
  Trash2,
  FileText,
} from "lucide-react"
import pako from "pako"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { currency } from "@/lib/utils"
import { toast } from "sonner"
import type { PedidoYaRow, SucursalLiquidacion, LiquidacionResumen } from "@/types"

// Datos demo Semana 02/11/2026 al 08/11/2026 (Liquidación RD$ 8,959.59)
const DEMO_CSV_DATA_NOV = `Número de pedido,Sucursal,Fecha de pedido,Monto bruto de la venta,Descuento otorgado por el local,Envio a cargo del local,Descuento comercial neto otorgado x PeYa,Cupon otorgado por el local,Desc. neto otorgado por Peya a usuarios,Desc. comerciales Retiro en el local,Descuento por Comodín pago por el local,Monto venta + envió cobrado por el local,Monto neto de la Venta ($),Monto comisionable Servicios PedidosYa,Servicio Ventas PedidosYA (%),Servicio Logística PedidosYA (%),Servicio Ventas PedidoYa ($),Servicio Logística PedidosYa ($),Cargo por Pedidos con Plus,Descuento tarifa de servicio al cliente,Pedido con Comodin,PLUS,Método de pago,Cobrado por,Método de entrega
2358800362,Bizcochao,05/11/2026,225,22.5,0,0,0,0,0,0,0,202.5,202.5,4.00%,22.00%,8.1,44.55,80,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2359166260,Bizcochao,06/11/2026,850,85,0,0,0,0,0,0,0,765,765,4.00%,22.00%,30.6,168.3,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2359685118,Bizcochao,06/11/2026,440,44,0,0,0,0,0,0,0,396,396,4.00%,22.00%,15.84,87.12,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2359797390,Bizcochao Los Jardines,06/11/2026,265,49.95,0,0,0,0,0,0,0,215.05,215.05,4.00%,16.00%,8.6,34.41,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2359999012,Bizcochao,06/11/2026,300,30,0,0,0,0,0,0,0,270,270,4.00%,22.00%,10.8,59.4,40,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2360061936,Bizcochao Los Jardines,06/11/2026,475,149.5,0,0,0,84.75,0,0,0,225.5,325.5,4.00%,16.00%,13.02,52.08,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2360522184,Bizcochao,06/11/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,80,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2360637590,Bizcochao,07/11/2026,160,0,0,0,0,0,0,0,0,160,160,4.00%,22.00%,6.4,35.2,55,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2360777864,Bizcochao Los Jardines,07/11/2026,115,0,0,0,0,0,0,0,0,115,115,4.00%,16.00%,4.6,18.4,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2361268037,Bizcochao Los Jardines,07/11/2026,320,0,0,0,0,0,0,0,0,320,320,4.00%,16.00%,12.8,51.2,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2361371019,Bizcochao Los Jardines,07/11/2026,250,100,0,0,0,0,0,0,0,150,150,4.00%,16.00%,6,24,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2361460010,Bizcochao Los Jardines,07/11/2026,750,255,0,0,0,0,0,0,0,495,495,4.00%,16.00%,19.8,79.2,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2361422099,Bizcochao Los Jardines,07/11/2026,400,149.95,0,0,0,0,0,0,0,250.05,250.05,4.00%,16.00%,10,40.01,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2361774303,Bizcochao Los Jardines,07/11/2026,500,200,0,0,0,0,0,0,0,300,300,4.00%,16.00%,12,48,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2362611945,Bizcochao Los Jardines,08/11/2026,515,0,0,0,0,0,0,0,0,515,515,4.00%,16.00%,20.6,82.4,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2362668264,Bizcochao,08/11/2026,525,157.5,0,0,0,0,0,0,0,367.5,367.5,4.00%,22.00%,14.7,80.85,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2362805678,Bizcochao,08/11/2026,440,0,0,0,0,0,0,0,0,440,440,4.00%,22.00%,17.6,96.8,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2362857202,Bizcochao,08/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,110,0,No,Si,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2362935183,Bizcochao Los Jardines,08/11/2026,365,0,0,0,0,0,0,0,0,365,365,4.00%,16.00%,14.6,58.4,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2363192298,Bizcochao,08/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2363202165,Bizcochao,08/11/2026,475,22.5,0,0,0,0,0,0,0,452.5,452.5,4.00%,22.00%,18.1,99.55,65,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2363659602,Bizcochao Los Jardines,08/11/2026,500,0,0,0,0,0,0,0,0,500,500,4.00%,16.00%,20,80,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2353494018,Bizcochao,02/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2354018700,Bizcochao,02/11/2026,225,0,0,0,0,0,0,0,0,225,225,4.00%,22.00%,9,49.5,55,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2354126544,Bizcochao,02/11/2026,680,0,0,0,0,0,0,0,0,680,680,4.00%,22.00%,27.2,149.6,110,0,No,Si,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2354527533,Bizcochao Los Jardines,02/11/2026,365,105.5,0,0,0,0,0,0,0,259.5,259.5,4.00%,16.00%,10.38,41.52,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2354583115,Bizcochao Los Jardines,02/11/2026,375,99.45,0,0,0,0,0,0,0,275.55,275.55,4.00%,16.00%,11.02,44.09,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2354587153,Bizcochao Los Jardines,02/11/2026,400,149.95,0,0,0,0,0,0,0,250.05,250.05,4.00%,16.00%,10,40.01,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2354594980,Bizcochao Los Jardines,02/11/2026,250,100,0,0,0,0,0,0,0,150,150,4.00%,16.00%,6,24,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2354676514,Bizcochao,02/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,130,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2354748106,Bizcochao,02/11/2026,1445,0,0,0,0,0,0,0,0,1445,1445,4.00%,22.00%,57.8,317.9,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2354753354,Bizcochao,02/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,80,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2355376696,Bizcochao Los Jardines,03/11/2026,750,300,0,0,0,0,0,0,0,450,450,4.00%,16.00%,18,72,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2355420518,Bizcochao Los Jardines,03/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,16.00%,12,48,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2355507772,Bizcochao Los Jardines,03/11/2026,450,99,0,0,0,0,0,0,0,351,351,4.00%,16.00%,14.04,56.16,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2355641622,Bizcochao,03/11/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2356032333,Bizcochao Los Jardines,03/11/2026,400,149.95,0,0,0,0,0,0,0,250.05,250.05,4.00%,16.00%,10,40.01,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2356149903,Bizcochao,03/11/2026,140,0,0,0,0,0,0,0,0,140,140,4.00%,22.00%,5.6,30.8,130,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2356284515,Bizcochao,04/11/2026,520,0,0,0,0,0,0,0,0,520,520,4.00%,22.00%,20.8,114.4,50,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2356493910,Bizcochao,04/11/2026,225,0,0,0,0,0,0,0,0,225,225,4.00%,22.00%,9,49.5,80,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2356789521,Bizcochao,04/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2356869230,Bizcochao,04/11/2026,405,0,0,0,0,0,0,0,0,405,405,4.00%,22.00%,16.2,89.1,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2358112934,Bizcochao,05/11/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2358446667,Bizcochao Los Jardines,05/11/2026,250,100,0,0,0,0,0,0,0,150,150,4.00%,16.00%,6,24,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa`

// Datos demo Semana 26/10/2026 al 01/11/2026 (Liquidación RD$ 7,044.86)
const DEMO_CSV_DATA_OCT = `Número de pedido,Sucursal,Fecha de pedido,Monto bruto de la venta,Descuento otorgado por el local,Envio a cargo del local,Descuento comercial neto otorgado x PeYa,Cupon otorgado por el local,Desc. neto otorgado por Peya a usuarios,Desc. comerciales Retiro en el local,Descuento por Comodín pago por el local,Monto venta + envió cobrado por el local,Monto neto de la Venta ($),Monto comisionable Servicios PedidosYa,Servicio Ventas PedidosYA (%),Servicio Logística PedidosYA (%),Servicio Ventas PedidoYa ($),Servicio Logística PedidosYa ($),Cargo por Pedidos con Plus,Descuento tarifa de servicio al cliente,Pedido con Comodin,PLUS,Método de pago,Cobrado por,Método de entrega
2352934729,Bizcochao,01/11/2026,450,0,0,0,0,0,0,0,0,450,450,4.00%,22.00%,18,99,110,0,No,Si,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2353132995,Bizcochao,01/11/2026,225,0,0,0,0,0,0,0,0,225,225,4.00%,22.00%,9,49.5,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2352934177,Bizcochao,01/11/2026,330,0,0,0,0,0,0,0,0,330,330,4.00%,22.00%,13.2,72.6,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2353073393,Bizcochao,01/11/2026,550,0,0,0,0,0,0,0,0,550,550,4.00%,22.00%,22,121,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2352699086,Bizcochao,01/11/2026,715,0,0,0,0,0,0,0,0,715,715,4.00%,22.00%,28.6,157.3,40,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2352759831,Bizcochao Los Jardines,01/11/2026,225,49.5,0,0,0,0,0,0,0,175.5,175.5,4.00%,16.00%,7.02,28.08,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2352595588,Bizcochao,01/11/2026,600,0,0,0,0,0,0,0,0,600,600,4.00%,22.00%,24,132,155,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2352410349,Bizcochao Los Jardines,01/11/2026,400,149.95,0,0,0,0,0,0,0,250.05,250.05,4.00%,16.00%,10,40.01,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2351751463,Bizcochao,01/11/2026,360,0,0,0,0,0,0,0,0,360,360,4.00%,22.00%,14.4,79.2,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2351750845,Bizcochao,01/11/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
2351474577,Bizcochao,31/10/2026,380,0,0,0,0,0,0,0,0,380,380,4.00%,22.00%,15.2,83.6,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2351422810,Bizcochao,31/10/2026,500,0,0,0,0,102.75,0,0,0,378.75,500,4.00%,22.00%,20,110,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2351358363,Bizcochao,31/10/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,65,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2350834251,Bizcochao,31/10/2026,550,0,0,0,0,0,0,0,0,550,550,4.00%,22.00%,22,121,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2350744208,Bizcochao,31/10/2026,500,0,0,0,0,0,0,0,0,500,500,4.00%,22.00%,20,110,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2350615468,Bizcochao,31/10/2026,740,0,0,0,0,0,0,0,0,740,740,4.00%,22.00%,29.6,162.8,55,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2350475865,Bizcochao Los Jardines,31/10/2026,650,249.95,0,0,0,0,0,0,0,400.05,400.05,4.00%,16.00%,16,64.01,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2350140664,Bizcochao,31/10/2026,700,0,0,0,0,0,0,0,0,700,700,4.00%,22.00%,28,154,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2349941552,Bizcochao,30/10/2026,225,0,0,0,0,0,0,0,0,225,225,4.00%,22.00%,9,49.5,80,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2349356276,Bizcochao Los Jardines,30/10/2026,890,356,0,0,0,59.32,0,0,0,464,534,4.00%,16.00%,21.36,85.44,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2349208457,Bizcochao Los Jardines,30/10/2026,250,100,0,0,0,0,0,0,0,150,150,4.00%,16.00%,6,24,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2348756116,Bizcochao,30/10/2026,300,0,0,0,0,0,0,0,0,300,300,4.00%,22.00%,12,66,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2348215206,Bizcochao,29/10/2026,550,0,0,0,0,0,0,0,0,550,550,4.00%,22.00%,22,121,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2348171927,Bizcochao,29/10/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,80,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2347757652,Bizcochao,29/10/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,65,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2347206338,Bizcochao,29/10/2026,380,0,0,0,0,0,0,0,0,380,380,4.00%,22.00%,15.2,83.6,90,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2346887471,Bizcochao Los Jardines,28/10/2026,150,0,0,0,0,0,0,0,0,150,150,4.00%,16.00%,6,24,0,0,No,,Pago en la aplicación,PedidosYa,Retiro en el local
2346854183,Bizcochao,28/10/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,80,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2346349878,Bizcochao Los Jardines,28/10/2026,150,0,0,0,0,0,0,0,0,150,150,4.00%,16.00%,6,24,0,0,No,,Pago en la aplicación,PedidosYa,Retiro en el local
2345590876,Bizcochao,27/10/2026,190,0,0,0,0,0,0,0,0,190,190,4.00%,22.00%,7.6,41.8,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2345512834,Bizcochao,27/10/2026,380,0,0,0,0,0,0,0,0,380,380,4.00%,22.00%,15.2,83.6,95,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2344429123,Bizcochao,26/10/2026,225,0,0,0,0,0,0,0,0,225,225,4.00%,22.00%,9,49.5,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2344312133,Bizcochao,26/10/2026,310,0,0,0,0,0,0,0,0,310,310,4.00%,22.00%,12.4,68.2,130,0,No,Si,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2344157282,Bizcochao,26/10/2026,250,0,0,0,0,0,0,0,0,250,250,4.00%,22.00%,10,55,0,0,No,,Pago en la aplicación,PedidosYa,Envío de PedidosYa
2343939319,Bizcochao,26/10/2026,490,0,0,0,0,0,0,0,0,490,490,4.00%,22.00%,19.6,107.8,0,0,No,,Pago fuera de la aplicación,PedidosYa,Envío de PedidosYa
Tipo de Cargo,Número de pedido,Estado del pedido,Sucursal,Fecha del pedido,Hora,Motivo,Monto del Pedido,Comisión PeYa,Monto final
Cargos por cancelaciones,2350819750,RECHAZADO,Bizcochao,31/10/2026,16:48:58,Hay mucha demanda en el local,360,93.6,-93.6
Cargos por cancelaciones,2348467964,RECHAZADO,Bizcochao,30/10/2026,08:42:45,Falta de productos,360,93.6,-93.6
Cargos por cancelaciones,2345313782,RECHAZADO,Bizcochao Los Jardines,27/10/2026,19:32:47,Falta de productos,250,50,-50
Cargos por cancelaciones,2343892023,RECHAZADO,Bizcochao,26/10/2026,16:22:42,Falta de productos,675,175.5,-175.5
Tipo de Cargo,Número de pedido,Estado del pedido,Sucursal,Fecha del pedido,Hora,Motivo,Comentarios de los usuarios,Monto del Pedido,Reintegro al usuario por reclamo,% de cargo sobre el reintegro al usuario,Cargos por reclamos de los usuarios
Cargos por reclamos,2347206338,CONFIRMADO,Bizcochao,29/10/2026,11:32:03,Producto faltante,,380,13,100.0 %,-13
Tipo de Reintegro,Número de pedido,Estado del pedido,Orden entregada al repartidor,Sucursal,Fecha del pedido,Hora confirmada del pedido,Monto del Pedido,% Servicios PedidosYA,Servicios PedidosYa,% de Reintegro,Monto Bruto a reintegrar,Impuesto sobre reintegro,Monto neto a reintegrar
Reintegros,2346354209,RECHAZADO,NO,Bizcochao Los Jardines,28/10/2026,16:48:55,500,20.00%,100,50.0 %,200,0,200
Reintegros,2345590448,RECHAZADO,NO,Bizcochao Los Jardines,27/10/2026,21:34:07,150,20.00%,30,50.0 %,60,0,60`

function norm(s: unknown): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^["']|["']$/g, "")
    .trim()
}

function parseNumber(val: unknown): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val
  if (!val) return 0
  const str = String(val).replace(/[^0-9.-]+/g, "")
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

function normalizeSucursalName(raw: string): string {
  const clean = raw.trim()
  if (clean.toLowerCase().includes("jardin")) {
    return "Bizcochao Los Jardines"
  }
  return "Bizcochao (Alma Rosa)"
}

interface ParsedPdfResult {
  periodo: string
  publicidad: number
  impuestos: number
  ajustes: number
  cancelaciones: number
  reclamos: number
  reintegrosCancelados: number
  totalLiquidado: number
}

function parsePedidosYaPdf(uint8Array: Uint8Array): ParsedPdfResult {
  let pos = 0
  let fullText = ""
  const len = uint8Array.length

  const streamMarker = [115, 116, 114, 101, 97, 109] // 'stream'
  const endStreamMarker = [101, 110, 100, 115, 116, 114, 101, 97, 109] // 'endstream'

  function findSubarray(sub: number[], start: number): number {
    outer: for (let i = start; i <= len - sub.length; i++) {
      for (let j = 0; j < sub.length; j++) {
        if (uint8Array[i + j] !== sub[j]) continue outer
      }
      return i
    }
    return -1
  }

  while (pos < len) {
    const sStart = findSubarray(streamMarker, pos)
    if (sStart === -1) break
    let dStart = sStart + 6
    if (uint8Array[dStart] === 13) dStart++
    if (uint8Array[dStart] === 10) dStart++

    const sEnd = findSubarray(endStreamMarker, dStart)
    if (sEnd === -1) break

    const streamSlice = uint8Array.subarray(dStart, sEnd)
    try {
      const decompressed = pako.inflate(streamSlice)
      let str = ""
      for (let i = 0; i < decompressed.length; i++) {
        str += String.fromCharCode(decompressed[i])
      }
      const tjRegex = /\((.*?)\)\s*Tj/g
      let m: RegExpExecArray | null
      while ((m = tjRegex.exec(str)) !== null) {
        let val = m[1]
        val = val
          .replace(/\\355/g, "í")
          .replace(/\\363/g, "ó")
          .replace(/\\341/g, "á")
          .replace(/\\351/g, "é")
          .replace(/\\372/g, "ú")
          .replace(/\\361/g, "ñ")
        fullText += val + "\n"
      }
    } catch {
      // no es un flujo deflate
    }

    pos = sEnd + 9
  }

  const lines = fullText.split("\n").map((l) => l.trim()).filter(Boolean)

  const findValueAfter = (keyword: string): number => {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(keyword.toLowerCase())) {
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const valMatch = lines[j].match(/RD\$\s*(-?[\d,.]+)/)
          if (valMatch) {
            const clean = valMatch[1].replace(/,/g, "")
            return parseFloat(clean)
          }
        }
      }
    }
    return 0
  }

  const findPeriodo = (): string => {
    for (const line of lines) {
      const m = line.match(/Per[íi]+odo\s+del\s+([\d/]+)\s+al\s+([\d/]+)/i)
      if (m) return `${m[1]} al ${m[2]}`
    }
    return ""
  }

  const publicidad = Math.abs(findValueAfter("publicidad dentro de la aplicaci"))
  const impuestos = Math.abs(findValueAfter("impuesto en comisiones") || findValueAfter("impuestos"))
  const ajustes = findValueAfter("ajustes de liquidaci")
  const cancelaciones = Math.abs(findValueAfter("cancelar o rechazar"))
  const reclamos = Math.abs(findValueAfter("cargos por reclamos"))
  const reintegrosCancelados = findValueAfter("reintegro por pedidos que cancelaron")
  const totalLiquidado = findValueAfter("total liquidado del") || findValueAfter("subtotal")

  return {
    periodo: findPeriodo(),
    publicidad,
    impuestos,
    ajustes,
    cancelaciones,
    reclamos,
    reintegrosCancelados,
    totalLiquidado,
  }
}

export function PedidosYaModule() {
  const [activeTab, setActiveTab] = useState<"resumen" | "detalle" | "cargar">("cargar")
  const [pasteData, setPasteData] = useState("")
  const [fileName, setFileName] = useState<string>("")
  const [presetActivo, setPresetActivo] = useState<"noviembre" | "octubre" | "personalizado" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  
  // Parámetros del PDF (Estado de cuenta oficial de PedidosYa)
  const [publicidadTotal, setPublicidadTotal] = useState<number>(0)
  const [impuestoTotal, setImpuestoTotal] = useState<number>(0)
  const [ajustesTotal, setAjustesTotal] = useState<number>(0)
  const [cargosCancelarTotal, setCargosCancelarTotal] = useState<number>(0)
  const [cargosReclamosTotal, setCargosReclamosTotal] = useState<number>(0)
  const [reintegrosCanceladosTotal, setReintegrosCanceladosTotal] = useState<number>(0)
  const [metodoDistribucion, setMetodoDistribucion] = useState<"ventas" | "igualitario" | "pedidos">("ventas")

  // Filtros de tabla de detalle
  const [filtroSucursal, setFiltroSucursal] = useState<string>("todas")
  const [busqueda, setBusqueda] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 15

  // Filas parseadas de pedidos
  const [pedidos, setPedidos] = useState<PedidoYaRow[]>([])

  const limpiarDatos = () => {
    setPedidos([])
    setFileName("")
    setPresetActivo(null)
    setPasteData("")
    setPublicidadTotal(0)
    setImpuestoTotal(0)
    setAjustesTotal(0)
    setCargosCancelarTotal(0)
    setCargosReclamosTotal(0)
    setReintegrosCanceladosTotal(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    if (pdfInputRef.current) {
      pdfInputRef.current.value = ""
    }
    setActiveTab("cargar")
    toast.info("Documento eliminado. La pantalla está limpia.")
  }

  const parseCsvText = (
    text: string,
    overrideCancelar?: number,
    overrideReclamos?: number,
    overrideReintegros?: number
  ) => {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) {
      toast.error("El contenido ingresado no tiene suficientes filas")
      return
    }

    const separator = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ","

    let currentSection: "pedidos" | "cancelaciones" | "reclamos" | "reintegros" = "pedidos"
    let headersPedidos: string[] = []

    let idxNum = -1
    let idxSuc = -1
    let idxFecha = -1
    let idxBruto = -1
    let idxDescLocal = -1
    let idxDescPeya = -1
    let idxNeto = -1
    let idxComisionable = -1
    let idxComVentaPct = -1
    let idxComLogPct = -1
    let idxComVentaMonto = -1
    let idxComLogMonto = -1
    let idxPlus = -1
    let idxMetodoPago = -1
    let idxCobradoPor = -1

    let detectedCancelar = 0
    let detectedReclamos = 0
    let detectedReintegros = 0

    const parsedRows: PedidoYaRow[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const cols = line.split(separator).map((c) => c.replace(/^["']|["']$/g, "").trim())
      const firstCol = norm(cols[0])

      // Detección de encabezado de pedidos
      if (firstCol.includes("numero de pedido") || firstCol.includes("pedido")) {
        currentSection = "pedidos"
        headersPedidos = cols.map(norm)

        const getIdx = (keywords: string[]) => {
          for (const kw of keywords) {
            const idx = headersPedidos.findIndex((h) => h.includes(norm(kw)))
            if (idx !== -1) return idx
          }
          return -1
        }

        idxNum = getIdx(["numero de pedido", "pedido", "orden"])
        idxSuc = getIdx(["sucursal", "local", "tienda"])
        idxFecha = getIdx(["fecha de pedido", "fecha"])
        idxBruto = getIdx(["monto bruto de la venta", "monto bruto"])
        idxDescLocal = getIdx(["descuento otorgado por el local", "descuento local"])
        idxDescPeya = getIdx(["desc. neto otorgado por peya a usuarios", "peya a usuarios"])
        // Búsqueda estricta de monto neto para no confundir con descuentos comerciales netos
        idxNeto = getIdx(["monto neto de la venta", "monto neto"])
        idxComisionable = getIdx(["monto comisionable"])
        idxComVentaPct = getIdx(["servicio ventas pedidosya (%)", "servicio ventas (%)"])
        idxComLogPct = getIdx(["servicio logistica pedidosya (%)", "servicio logistica (%)"])
        idxComVentaMonto = getIdx(["servicio ventas pedidoya ($)", "servicio ventas pedidosya ($)", "servicio ventas ($)"])
        idxComLogMonto = getIdx(["servicio logistica pedidosya ($)", "servicio logistica pedidoya ($)", "servicio logistica ($)"])
        idxPlus = getIdx(["cargo por pedidos con plus", "cargo plus"])
        idxMetodoPago = getIdx(["metodo de pago"])
        idxCobradoPor = headersPedidos.findLastIndex((h) => h.includes("cobrado por"))
        continue
      }

      // Detección de secciones de penalidades o reintegros adicionales
      if (firstCol.startsWith("tipo de cargo") || firstCol.startsWith("tipo de reintegro")) {
        const lineNorm = norm(line)
        if (lineNorm.includes("reclamo")) {
          currentSection = "reclamos"
        } else if (lineNorm.includes("reintegro")) {
          currentSection = "reintegros"
        } else {
          currentSection = "cancelaciones"
        }
        continue
      }

      if (currentSection === "pedidos") {
        const sucursalRaw = idxSuc !== -1 ? cols[idxSuc] : "Bizcochao"
        const bruto = parseNumber(idxBruto !== -1 ? cols[idxBruto] : 0)
        const descLocal = parseNumber(idxDescLocal !== -1 ? cols[idxDescLocal] : 0)
        const descPeya = parseNumber(idxDescPeya !== -1 ? cols[idxDescPeya] : 0)
        let neto = parseNumber(idxNeto !== -1 ? cols[idxNeto] : 0)
        if (neto === 0 && bruto > 0 && descLocal > 0) {
          neto = bruto - descLocal
        }

        parsedRows.push({
          numeroPedido: idxNum !== -1 ? cols[idxNum] : `ORD-${i}`,
          sucursal: normalizeSucursalName(sucursalRaw),
          fecha: idxFecha !== -1 ? cols[idxFecha] : "",
          montoBruto: bruto,
          descuentoLocal: descLocal,
          envioLocal: 0,
          descuentoPeyaUsuarios: descPeya,
          montoNetoVenta: neto,
          montoComisionable: parseNumber(idxComisionable !== -1 ? cols[idxComisionable] : neto),
          servicioVentasPct: parseNumber(idxComVentaPct !== -1 ? cols[idxComVentaPct] : 4),
          servicioLogisticaPct: parseNumber(idxComLogPct !== -1 ? cols[idxComLogPct] : 0),
          servicioVentasMonto: parseNumber(idxComVentaMonto !== -1 ? cols[idxComVentaMonto] : 0),
          servicioLogisticaMonto: parseNumber(idxComLogMonto !== -1 ? cols[idxComLogMonto] : 0),
          cargoPlus: parseNumber(idxPlus !== -1 ? cols[idxPlus] : 0),
          esPlus: parseNumber(idxPlus !== -1 ? cols[idxPlus] : 0) > 0,
          metodoPago: idxMetodoPago !== -1 ? cols[idxMetodoPago] : "Pago en la aplicación",
          cobradoPor: idxCobradoPor !== -1 ? cols[idxCobradoPor] : "PedidosYa",
          metodoEntrega: "Envío de PedidosYa",
        })
      } else if (currentSection === "cancelaciones") {
        const val = Math.abs(parseNumber(cols[cols.length - 1]))
        detectedCancelar += val
      } else if (currentSection === "reclamos") {
        const val = Math.abs(parseNumber(cols[cols.length - 1]))
        detectedReclamos += val
      } else if (currentSection === "reintegros") {
        const val = Math.abs(parseNumber(cols[cols.length - 1]))
        detectedReintegros += val
      }
    }

    if (overrideCancelar !== undefined) {
      setCargosCancelarTotal(overrideCancelar)
    } else if (detectedCancelar > 0) {
      setCargosCancelarTotal(detectedCancelar)
    }

    if (overrideReclamos !== undefined) {
      setCargosReclamosTotal(overrideReclamos)
    } else if (detectedReclamos > 0) {
      setCargosReclamosTotal(detectedReclamos)
    }

    if (overrideReintegros !== undefined) {
      setReintegrosCanceladosTotal(overrideReintegros)
    } else if (detectedReintegros > 0) {
      setReintegrosCanceladosTotal(detectedReintegros)
    }

    setPedidos(parsedRows)
    setActiveTab("resumen")
    toast.success(`Se procesaron ${parsedRows.length} pedidos correctamente`)
  }

  const handlePdfFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer
        if (!buffer) return
        const pdfData = parsePedidosYaPdf(new Uint8Array(buffer))

        if (pdfData.publicidad > 0) setPublicidadTotal(pdfData.publicidad)
        if (pdfData.impuestos > 0) setImpuestoTotal(pdfData.impuestos)
        if (pdfData.ajustes !== 0) setAjustesTotal(pdfData.ajustes)
        if (pdfData.cancelaciones > 0) setCargosCancelarTotal(pdfData.cancelaciones)
        if (pdfData.reclamos > 0) setCargosReclamosTotal(pdfData.reclamos)
        if (pdfData.reintegrosCancelados > 0) setReintegrosCanceladosTotal(pdfData.reintegrosCancelados)

        const infoPeriodo = pdfData.periodo ? ` (${pdfData.periodo})` : ""
        toast.success(
          `Estado de cuenta PDF cargado${infoPeriodo}: Total liquidado ${currency(pdfData.totalLiquidado)}`
        )
        setActiveTab("resumen")
      } catch (err: unknown) {
        console.error(err)
        toast.error("Error al procesar el archivo PDF")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setPresetActivo("personalizado")

    const lowerName = file.name.toLowerCase()

    if (lowerName.endsWith(".pdf")) {
      handlePdfFile(file)
      e.target.value = ""
      return
    }

    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const binaryStr = evt.target?.result
          const workbook = XLSX.read(binaryStr, { type: "binary" })

          let mainSheetName = workbook.SheetNames[0]
          for (const sName of workbook.SheetNames) {
            const n = sName.toLowerCase()
            if (n.includes("pedido") || n.includes("orden") || n.includes("lista")) {
              mainSheetName = sName
              break
            }
          }

          const wsMain = workbook.Sheets[mainSheetName]
          const csvText = XLSX.utils.sheet_to_csv(wsMain)

          // Extraer penalidades y reintegros de las hojas secundarias si existen
          let detectedCancelar = 0
          let detectedReclamos = 0
          let detectedReintegros = 0

          for (const sName of workbook.SheetNames) {
            if (sName === mainSheetName) continue
            const n = sName.toLowerCase()
            const ws = workbook.Sheets[sName]
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

            if (n.includes("cancelac") || n.includes("cancelar")) {
              for (const r of rows) {
                const val = Math.abs(
                  parseNumber(
                    (r["Monto final"] as string | number) ??
                    (r["Comisión PeYa"] as string | number) ??
                    0
                  )
                )
                detectedCancelar += val
              }
            } else if (n.includes("reclamo")) {
              for (const r of rows) {
                const val = Math.abs(
                  parseNumber(
                    (r["Cargos por reclamos de los usuarios"] as string | number) ??
                    (r["Reintegro al usuario por reclamo"] as string | number) ??
                    0
                  )
                )
                detectedReclamos += val
              }
            } else if (n.includes("reintegro")) {
              for (const r of rows) {
                const val = Math.abs(
                  parseNumber(
                    (r["Monto neto a reintegrar"] as string | number) ??
                    (r["Monto Bruto a reintegrar"] as string | number) ??
                    0
                  )
                )
                detectedReintegros += val
              }
            }
          }

          // Limpiar cargos de publicidad/impuestos de semanas anteriores para no contaminar
          setPublicidadTotal(0)
          setImpuestoTotal(0)
          setAjustesTotal(0)
          setCargosCancelarTotal(detectedCancelar)
          setCargosReclamosTotal(detectedReclamos)
          setReintegrosCanceladosTotal(detectedReintegros)

          parseCsvText(csvText, detectedCancelar, detectedReclamos, detectedReintegros)
        } catch (err: unknown) {
          console.error(err)
          toast.error("Error al leer el archivo Excel")
        }
      }
      reader.readAsBinaryString(file)
    } else {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const text = evt.target?.result as string
        if (text) {
          setPublicidadTotal(0)
          setImpuestoTotal(0)
          setAjustesTotal(0)
          parseCsvText(text)
        }
      }
      reader.readAsText(file)
    }
    e.target.value = ""
  }

  const handlePdfUploadDirect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handlePdfFile(file)
    e.target.value = ""
  }

  const cargarPreset = (semana: "noviembre" | "octubre") => {
    if (semana === "noviembre") {
      setPresetActivo("noviembre")
      setFileName("Semana 02/11/2026 - 08/11/2026 (invoice-7600821271)")
      setPublicidadTotal(1298.30)
      setImpuestoTotal(343.71)
      setAjustesTotal(15.26)
      setCargosCancelarTotal(0)
      setCargosReclamosTotal(0)
      setReintegrosCanceladosTotal(0)
      parseCsvText(DEMO_CSV_DATA_NOV, 0, 0, 0)
      toast.success("Cargada Semana 02/11 al 08/11 (RD$ 8,959.59)")
    } else {
      setPresetActivo("octubre")
      setFileName("Semana 26/10/2026 - 01/11/2026 (invoice-7600816629)")
      setPublicidadTotal(1078.96)
      setImpuestoTotal(364.15)
      setAjustesTotal(29.17)
      setCargosCancelarTotal(412.70)
      setCargosReclamosTotal(13.00)
      setReintegrosCanceladosTotal(260.00)
      parseCsvText(DEMO_CSV_DATA_OCT, 412.70, 13.00, 260.00)
      toast.success("Cargada Semana 26/10 al 01/11 (RD$ 7,044.86)")
    }
  }

  // Agrupación y liquidación calculada
  const liquidacion: LiquidacionResumen = useMemo(() => {
    const porSucursal: Record<string, SucursalLiquidacion> = {}

    let totalPedidos = 0
    let totalBruto = 0
    let totalDescuentos = 0
    let totalVentasNetas = 0
    let totalComisiones = 0
    let totalPlus = 0
    let totalReintegros = 0

    // 1. Acumulados directos por pedido
    for (const p of pedidos) {
      if (!porSucursal[p.sucursal]) {
        porSucursal[p.sucursal] = {
          sucursal: p.sucursal,
          pedidos: 0,
          montoBruto: 0,
          descuentoLocal: 0,
          ventaNeta: 0,
          comisionVentas: 0,
          comisionLogistica: 0,
          totalComisiones: 0,
          cargoPlus: 0,
          reintegrosPeya: 0,
          margenOperativo: 0,
          publicidad: 0,
          impuestos: 0,
          ajustes: 0,
          cargosCancelar: 0,
          cargosReclamos: 0,
          reintegrosCancelados: 0,
          totalCargosGlobales: 0,
          gananciaNeta: 0,
          ventasPagoApp: 0,
          ventasPagoFueraApp: 0,
        }
      }

      const s = porSucursal[p.sucursal]
      s.pedidos += 1
      s.montoBruto += p.montoBruto
      s.descuentoLocal += p.descuentoLocal
      s.ventaNeta += p.montoNetoVenta
      s.comisionVentas += p.servicioVentasMonto
      s.comisionLogistica += p.servicioLogisticaMonto
      s.totalComisiones += p.servicioVentasMonto + p.servicioLogisticaMonto
      s.cargoPlus += p.cargoPlus
      s.reintegrosPeya += p.descuentoPeyaUsuarios

      if (p.metodoPago.toLowerCase().includes("fuera")) {
        s.ventasPagoFueraApp += p.montoNetoVenta
      } else {
        s.ventasPagoApp += p.montoNetoVenta
      }

      totalPedidos += 1
      totalBruto += p.montoBruto
      totalDescuentos += p.descuentoLocal
      totalVentasNetas += p.montoNetoVenta
      totalComisiones += p.servicioVentasMonto + p.servicioLogisticaMonto
      totalPlus += p.cargoPlus
      totalReintegros += p.descuentoPeyaUsuarios
    }

    const sucursalesKeys = Object.keys(porSucursal)
    const numSucursales = sucursalesKeys.length || 1

    // 2. Cargos globales netos del estado de cuenta PDF
    const totalCargosGlobales =
      publicidadTotal +
      impuestoTotal +
      cargosCancelarTotal +
      cargosReclamosTotal -
      ajustesTotal -
      reintegrosCanceladosTotal

    // 3. Prorrateo de gastos generales
    for (const key of sucursalesKeys) {
      const s = porSucursal[key]
      s.margenOperativo = s.ventaNeta - s.totalComisiones - s.cargoPlus + s.reintegrosPeya

      // Ratio de distribución (proporcional a ventas netas por defecto como distribuye PedidosYa)
      let ratioDistribucion = 0
      if (metodoDistribucion === "ventas") {
        ratioDistribucion = totalVentasNetas > 0 ? s.ventaNeta / totalVentasNetas : 1 / numSucursales
      } else if (metodoDistribucion === "pedidos") {
        ratioDistribucion = totalPedidos > 0 ? s.pedidos / totalPedidos : 1 / numSucursales
      } else {
        ratioDistribucion = 1 / numSucursales
      }

      s.publicidad = publicidadTotal * ratioDistribucion
      s.impuestos = impuestoTotal * ratioDistribucion
      s.ajustes = ajustesTotal * ratioDistribucion
      s.cargosCancelar = cargosCancelarTotal * ratioDistribucion
      s.cargosReclamos = cargosReclamosTotal * ratioDistribucion
      s.reintegrosCancelados = reintegrosCanceladosTotal * ratioDistribucion
      s.totalCargosGlobales = totalCargosGlobales * ratioDistribucion

      s.gananciaNeta = s.margenOperativo - s.totalCargosGlobales
    }

    const totalLiquidado =
      totalVentasNetas - totalComisiones - totalPlus + totalReintegros - totalCargosGlobales

    return {
      fechaCarga: new Date().toISOString(),
      totalPedidos,
      totalBruto,
      totalDescuentos,
      totalVentasNetas,
      totalComisiones,
      totalPlus,
      totalReintegros,
      totalPublicidad: publicidadTotal,
      totalImpuestos: impuestoTotal,
      totalAjustes: ajustesTotal,
      totalCargosCancelar: cargosCancelarTotal,
      totalCargosReclamos: cargosReclamosTotal,
      totalReintegrosCancelados: reintegrosCanceladosTotal,
      totalCargosGlobales,
      totalLiquidado,
      metodoDistribucion,
      porSucursal,
      pedidos,
    }
  }, [
    pedidos,
    publicidadTotal,
    impuestoTotal,
    ajustesTotal,
    cargosCancelarTotal,
    cargosReclamosTotal,
    reintegrosCanceladosTotal,
    metodoDistribucion,
  ])

  // Filtrado de pedidos
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      const matchSuc = filtroSucursal === "todas" || p.sucursal === filtroSucursal
      const matchBusqueda =
        busqueda === "" ||
        p.numeroPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.fecha.includes(busqueda)
      return matchSuc && matchBusqueda
    })
  }, [pedidos, filtroSucursal, busqueda])

  const totalPages = Math.ceil(pedidosFiltrados.length / pageSize) || 1
  const paginatedPedidos = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return pedidosFiltrados.slice(start, start + pageSize)
  }, [pedidosFiltrados, currentPage, pageSize])

  const sucursalesList = Object.values(liquidacion.porSucursal)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight">
              Liquidaciones PedidosYa
            </h1>
            <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-900">
              Conciliación Multitienda
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Desglose semanal de ventas, comisiones, promociones asumidas y ganancia neta por sucursal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pedidos.length > 0 && (
            <>
              <Badge variant="outline" className="hidden sm:inline-flex bg-muted/50 text-foreground font-normal text-xs py-1 px-2.5 gap-1.5 max-w-[260px] truncate">
                <FileSpreadsheet className="size-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">{fileName || "Documento en memoria"}</span>
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={limpiarDatos}
                className="gap-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-rose-300 dark:border-rose-900"
                title="Eliminar documento cargado y reiniciar pantalla"
              >
                <Trash2 className="size-3.5" />
                Limpiar datos
              </Button>
            </>
          )}

          <Button
            variant={pedidos.length === 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("cargar")}
            className="gap-2"
          >
            <Upload className="size-4" />
            {pedidos.length === 0 ? "Cargar Archivo Excel" : "Cargar otro"}
          </Button>

          {pedidos.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2 print:hidden"
            >
              <Printer className="size-4" />
              Imprimir
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Principales */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "resumen" | "detalle" | "cargar")}>
        <TabsList className="grid w-full sm:w-[480px] grid-cols-3">
          <TabsTrigger value="resumen">Resumen por Sucursal</TabsTrigger>
          <TabsTrigger value="detalle">
            Detalle Pedidos ({pedidos.length})
          </TabsTrigger>
          <TabsTrigger value="cargar">Cargar Datos</TabsTrigger>
        </TabsList>

        {/* PESTAÑA 1: RESUMEN FINANCIERO */}
        <TabsContent value="resumen" className="flex flex-col gap-6 mt-6">
          {pedidos.length === 0 ? (
            <Card className="border-2 border-dashed border-border p-10 md:p-14 text-center bg-card shadow-sm">
              <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  No hay ningún documento cargado
                </h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  Sube el archivo Excel semanal de PedidosYa o pega los datos para calcular la liquidación neta de cada sucursal. Los datos se procesan en memoria; si recargas la página o haces clic en "Limpiar datos", se borran.
                </p>
                <Button onClick={() => setActiveTab("cargar")} className="gap-2">
                  <Upload className="size-4" />
                  Ir a Cargar Archivo Excel
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {/* Tarjetas Principales de Ganancia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {liquidacion.totalPublicidad > 0 || liquidacion.totalImpuestos > 0 || liquidacion.totalCargosGlobales !== 0
                    ? "Total Liquidado Banco (PDF)"
                    : "Margen Directo de Pedidos"}
                </CardDescription>
                <CardTitle className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  {currency(liquidacion.totalLiquidado)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2 mt-2">
                  <span>{liquidacion.totalPedidos} pedidos en la semana</span>
                  {liquidacion.totalPublicidad > 0 || liquidacion.totalImpuestos > 0 || liquidacion.totalCargosGlobales !== 0 ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300">
                      Conciliado 100% con PDF
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300">
                      Margen Directo (Falta PDF)
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {sucursalesList.map((s) => {
              const porcentaje = liquidacion.totalLiquidado > 0
                ? ((s.gananciaNeta / liquidacion.totalLiquidado) * 100).toFixed(1)
                : "0"

              return (
                <Card key={s.sucursal} className="border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" />
                        {s.sucursal}
                      </CardDescription>
                      <Badge variant="secondary" className="font-semibold text-xs">
                        {porcentaje}%
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-heading font-bold text-primary">
                      {currency(s.gananciaNeta)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t pt-2 mt-1">
                      <div className="flex justify-between">
                        <span>Ventas Netas:</span>
                        <span className="font-medium text-foreground">{currency(s.ventaNeta)}</span>
                      </div>
                      <div className="flex justify-between text-rose-500">
                        <span>Descuentos Local:</span>
                        <span className="font-medium">-{currency(s.descuentoLocal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comisiones Peya:</span>
                        <span className="font-medium text-foreground">-{currency(s.totalComisiones)}</span>
                      </div>
                      {s.cargoPlus > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span>Cargos PLUS:</span>
                          <span className="font-medium">-{currency(s.cargoPlus)}</span>
                        </div>
                      )}
                      {s.reintegrosPeya > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Reintegros Peya:</span>
                          <span className="font-medium">+{currency(s.reintegrosPeya)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-rose-600/80">
                        <span>Cargos Globales PDF:</span>
                        <span className="font-medium">-{currency(s.totalCargosGlobales)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Alerta si falta conciliar los cargos del PDF */}
          {liquidacion.totalPublicidad === 0 && liquidacion.totalImpuestos === 0 && pedidos.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="size-5 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold">
                    Mostrando Margen Directo de Pedidos ({currency(liquidacion.totalLiquidado)})
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    El archivo Excel contiene los pedidos pero no incluye Publicidad e Impuestos. Para cuadrar con el depósito real del banco, ingresa los valores abajo o sube tu Estado de Cuenta en PDF.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pdfInputRef.current?.click()}
                className="h-8 text-xs border-amber-500/50 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 gap-1.5 shrink-0"
              >
                <FileText className="size-3.5" />
                Subir PDF Semanal
              </Button>
            </div>
          )}

          {/* Ajustes del Estado de Cuenta (PDF) */}
          <Card className="border-border bg-muted/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    Gastos e Impuestos del Estado de Cuenta Semanal (PDF)
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Montos globales de PedidosYa que se distribuyen entre las sucursales para cuadrar exactamente con el total transferido al banco.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => pdfInputRef.current?.click()}
                    className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                    title="Subir PDF del Estado de Cuenta para auto-llenar estos campos"
                  >
                    <FileText className="size-3.5" />
                    Auto-llenar con PDF
                  </Button>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUploadDirect}
                    className="hidden"
                  />
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-300 w-fit">
                    Total Cargos Globales: -{currency(liquidacion.totalCargosGlobales)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Publicidad (Campaña Gold VIP)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">RD$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={publicidadTotal}
                      onChange={(e) => setPublicidadTotal(parseFloat(e.target.value) || 0)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Impuesto IVA sobre Comisiones
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">RD$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={impuestoTotal}
                      onChange={(e) => setImpuestoTotal(parseFloat(e.target.value) || 0)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Ajustes de liquidación (A favor)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">RD$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={ajustesTotal}
                      onChange={(e) => setAjustesTotal(parseFloat(e.target.value) || 0)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Método de Distribución
                  </label>
                  <Select
                    value={metodoDistribucion}
                    onValueChange={(v) => setMetodoDistribucion((v as "ventas" | "igualitario" | "pedidos") || "ventas")}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ventas">Proporcional a Ventas (Recomendado)</SelectItem>
                      <SelectItem value="igualitario">Dividido 50% / 50%</SelectItem>
                      <SelectItem value="pedidos">Proporcional por Cantidad de Pedidos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Cargos Cancelar / Rechazar
                    </label>
                    {cargosCancelarTotal > 0 && (
                      <span className="text-[10px] text-amber-500 font-medium">Auto-detectado</span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">RD$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={cargosCancelarTotal}
                      onChange={(e) => setCargosCancelarTotal(parseFloat(e.target.value) || 0)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Cargos Reclamos Usuarios
                    </label>
                    {cargosReclamosTotal > 0 && (
                      <span className="text-[10px] text-amber-500 font-medium">Auto-detectado</span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">RD$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={cargosReclamosTotal}
                      onChange={(e) => setCargosReclamosTotal(parseFloat(e.target.value) || 0)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Reintegros Pedidos Cancelados
                    </label>
                    {reintegrosCanceladosTotal > 0 && (
                      <span className="text-[10px] text-green-500 font-medium">Auto-detectado</span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">RD$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={reintegrosCanceladosTotal}
                      onChange={(e) => setReintegrosCanceladosTotal(parseFloat(e.target.value) || 0)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabla Comparativa de Liquidación */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading">
                Tabla de Conciliación Detallada por Sucursal
              </CardTitle>
              <CardDescription className="text-xs">
                {fileName} — Todos los descuentos de local se aplican exclusivamente a su respectiva tienda.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px] font-semibold text-foreground">Concepto / Métrica</TableHead>
                    {sucursalesList.map((s) => (
                      <TableHead key={s.sucursal} className="text-right font-semibold text-foreground">
                        {s.sucursal}
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-bold text-foreground border-l-2 border-border/80 bg-muted/60 dark:bg-muted/40 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <FileSpreadsheet className="size-3.5 text-primary" />
                        <span>Total Liquidación (PDF)</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Cantidad de Pedidos</TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right">
                        {s.pedidos}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold text-foreground border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      {liquidacion.totalPedidos}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">Monto Bruto de Ventas</TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right">
                        {currency(s.montoBruto)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold text-foreground border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      {currency(liquidacion.totalBruto)}
                    </TableCell>
                  </TableRow>

                  <TableRow className="bg-rose-50/50 dark:bg-rose-950/20">
                    <TableCell className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Tag className="size-3.5" />
                      Descuento otorgado por el local
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right font-semibold text-rose-600 dark:text-rose-400">
                        -{currency(s.descuentoLocal)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400 border-l-2 border-border/80 bg-rose-50/60 dark:bg-rose-950/25">
                      -{currency(liquidacion.totalDescuentos)}
                    </TableCell>
                  </TableRow>

                  <TableRow className="font-semibold bg-muted/20">
                    <TableCell>Ventas Netas</TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right">
                        {currency(s.ventaNeta)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold text-foreground border-l-2 border-border/80 bg-muted/50 dark:bg-muted/25">
                      {currency(liquidacion.totalVentasNetas)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground text-xs">
                      • Comisión Ventas PedidosYa (4.00%)
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                        -{currency(s.comisionVentas)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-muted-foreground text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      -{currency(sucursalesList.reduce((acc, s) => acc + s.comisionVentas, 0))}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="pl-6 text-muted-foreground text-xs">
                      • Comisión Logística PedidosYa (22% / 16%)
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                        -{currency(s.comisionLogistica)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-muted-foreground text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      -{currency(sucursalesList.reduce((acc, s) => acc + s.comisionLogistica, 0))}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">Total Comisiones de Servicios</TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-rose-600 dark:text-rose-400">
                        -{currency(s.totalComisiones)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400 border-l-2 border-border/80 bg-muted/40 dark:bg-muted/20">
                      -{currency(liquidacion.totalComisiones)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">Cargos Pedidos con PLUS</TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-amber-600">
                        {s.cargoPlus > 0 ? `-${currency(s.cargoPlus)}` : "RD$ 0.00"}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold text-amber-600 dark:text-amber-500 border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      -{currency(liquidacion.totalPlus)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">Reintegros PedidosYa a usuarios</TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-green-600">
                        {s.reintegrosPeya > 0 ? `+${currency(s.reintegrosPeya)}` : "RD$ 0.00"}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-500 border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      +{currency(liquidacion.totalReintegros)}
                    </TableCell>
                  </TableRow>

                  <TableRow className="border-t-2 border-border bg-muted/40 font-semibold">
                    <TableCell>Margen Operativo Directo</TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right">
                        {currency(s.margenOperativo)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right font-extrabold text-foreground border-l-2 border-border/80 bg-muted/60 dark:bg-muted/30">
                      {currency(sucursalesList.reduce((acc, s) => acc + s.margenOperativo, 0))}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-muted-foreground text-xs">
                      Publicidad Campaña Gold VIP ({metodoDistribucion === "ventas" ? "por ventas" : metodoDistribucion === "igualitario" ? "50/50" : "por pedidos"})
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                        -{currency(s.publicidad)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-muted-foreground text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      -{currency(liquidacion.totalPublicidad)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-muted-foreground text-xs">
                      Impuesto IVA sobre Comisiones ({metodoDistribucion === "ventas" ? "por ventas" : metodoDistribucion === "igualitario" ? "50/50" : "por pedidos"})
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                        -{currency(s.impuestos)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-muted-foreground text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      -{currency(liquidacion.totalImpuestos)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-muted-foreground text-xs">
                      Ajuste de Liquidación ({metodoDistribucion === "ventas" ? "por ventas" : metodoDistribucion === "igualitario" ? "50/50" : "por pedidos"})
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                        +{currency(s.ajustes)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-500 font-medium text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                      +{currency(liquidacion.totalAjustes)}
                    </TableCell>
                  </TableRow>

                  {liquidacion.totalCargosCancelar > 0 && (
                    <TableRow>
                      <TableCell className="text-muted-foreground text-xs">
                        Cargos por cancelar / rechazar pedidos
                      </TableCell>
                      {sucursalesList.map((s) => (
                        <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                          -{currency(s.cargosCancelar)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-muted-foreground text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                        -{currency(liquidacion.totalCargosCancelar)}
                      </TableCell>
                    </TableRow>
                  )}

                  {liquidacion.totalCargosReclamos > 0 && (
                    <TableRow>
                      <TableCell className="text-muted-foreground text-xs">
                        Cargos por reclamos de usuarios
                      </TableCell>
                      {sucursalesList.map((s) => (
                        <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                          -{currency(s.cargosReclamos)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-muted-foreground text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                        -{currency(liquidacion.totalCargosReclamos)}
                      </TableCell>
                    </TableRow>
                  )}

                  {liquidacion.totalReintegrosCancelados > 0 && (
                    <TableRow>
                      <TableCell className="text-muted-foreground text-xs">
                        Reintegro por pedidos que cancelaron los usuarios
                      </TableCell>
                      {sucursalesList.map((s) => (
                        <TableCell key={s.sucursal} className="text-right text-green-600 text-xs">
                          +{currency(s.reintegrosCancelados)}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-green-600 font-medium text-xs border-l-2 border-border/80 bg-muted/30 dark:bg-muted/15">
                        +{currency(liquidacion.totalReintegrosCancelados)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow className="border-t-2 border-primary bg-primary/10 font-bold text-base">
                    <TableCell className="text-primary flex items-center gap-2">
                      <ShieldCheck className="size-5" />
                      GANANCIA NETA LIQUIDADA
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-primary text-lg">
                        {currency(s.gananciaNeta)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-xl font-extrabold border-l-2 border-emerald-500/80 text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 dark:bg-emerald-950/40">
                      {currency(liquidacion.totalLiquidado)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
            </>
          )}
        </TabsContent>

        {/* PESTAÑA 2: DETALLE DE PEDIDOS */}
        <TabsContent value="detalle" className="flex flex-col gap-4 mt-6">
          {pedidos.length === 0 ? (
            <Card className="border-2 border-dashed border-border p-10 md:p-14 text-center bg-card shadow-sm">
              <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="size-8 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  No hay pedidos para mostrar
                </h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                  Carga un archivo Excel de liquidación para ver el listado detallado de cada pedido y sus comisiones.
                </p>
                <Button onClick={() => setActiveTab("cargar")} className="gap-2">
                  <Upload className="size-4" />
                  Cargar Archivo Excel
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por # pedido o fecha..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select
                value={filtroSucursal}
                onValueChange={(v) => {
                  setFiltroSucursal(v || "todas")
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filtrar por sucursal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las sucursales</SelectItem>
                  {sucursalesList.map((s) => (
                    <SelectItem key={s.sucursal} value={s.sucursal}>
                      {s.sucursal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-border">
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-xs">
                    <TableHead># Pedido</TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Bruto</TableHead>
                    <TableHead className="text-right">Desc. Local</TableHead>
                    <TableHead className="text-right">Venta Neta</TableHead>
                    <TableHead className="text-right">Com. Venta (4%)</TableHead>
                    <TableHead className="text-right">Com. Logística</TableHead>
                    <TableHead className="text-center">Plus</TableHead>
                    <TableHead>Método Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center text-muted-foreground text-sm">
                        No se encontraron pedidos con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPedidos.map((p) => {
                      return (
                        <TableRow key={p.numeroPedido} className="text-xs hover:bg-muted/40">
                          <TableCell className="font-mono font-medium">{p.numeroPedido}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[11px] font-normal">
                              {p.sucursal}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground whitespace-nowrap">{p.fecha}</TableCell>
                          <TableCell className="text-right font-medium">{currency(p.montoBruto)}</TableCell>
                          <TableCell className="text-right text-rose-500">
                            {p.descuentoLocal > 0 ? `-${currency(p.descuentoLocal)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {currency(p.montoNetoVenta)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            -{currency(p.servicioVentasMonto)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            <span className="font-mono">
                              -{currency(p.servicioLogisticaMonto)}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              ({p.servicioLogisticaPct}%)
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {p.esPlus ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 text-[10px]">
                                PLUS ({currency(p.cargoPlus)})
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <span className={p.metodoPago.includes("fuera") ? "text-amber-500 font-medium" : "text-muted-foreground"}>
                              {p.metodoPago}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Paginación */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>
              Mostrando {Math.min(pedidosFiltrados.length, (currentPage - 1) * pageSize + 1)} -{" "}
              {Math.min(pedidosFiltrados.length, currentPage * pageSize)} de {pedidosFiltrados.length} pedidos
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
            </>
          )}
        </TabsContent>

        {/* PESTAÑA 3: CARGAR DATOS */}
        <TabsContent value="cargar" className="flex flex-col gap-6 mt-6">
          {pedidos.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-foreground">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Documento cargado en memoria: {fileName || "Datos procesados"}
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    {pedidos.length} pedidos conciliados. Si recargas la página o haces clic en Limpiar, se descarta.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("resumen")}
                  className="h-8 text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
                >
                  Ver Resumen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limpiarDatos}
                  className="h-8 text-xs border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-500/10 gap-1.5"
                >
                  <Trash2 className="size-3.5" />
                  Borrar / Descartar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción 1: Subir Archivo */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-emerald-500" />
                  Opción 1: Subir Archivo Excel o PDF
                </CardTitle>
                <CardDescription className="text-xs">
                  Sube el archivo Excel semanal con pedidos y penalidades, o el Estado de Cuenta oficial en PDF.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 hover:border-primary/60 transition-colors text-center cursor-pointer relative bg-muted/10">
                  <Upload className="size-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos admitidos: Excel (.xlsx, .xls), Estado de Cuenta (.pdf), CSV
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {fileName && (
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border">
                    <span className="truncate max-w-[240px]">Archivo: <strong>{fileName}</strong></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1"
                      onClick={limpiarDatos}
                    >
                      <Trash2 className="size-3" />
                      Descartar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opción 2: Pegar Texto Directo */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardPaste className="size-4 text-blue-500" />
                  Opción 2: Pegar Datos de Excel (Copiar y Pegar)
                </CardTitle>
                <CardDescription className="text-xs">
                  Abre tu Excel de PedidosYa, selecciona las celdas (o Ctrl+A), copia (Ctrl+C) y pégalas aquí.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <textarea
                  className="w-full h-44 p-3 rounded-lg border border-input bg-background text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Pega aquí las filas copiadas desde Excel..."
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (!pasteData.trim()) {
                      toast.error("Por favor pega contenido en el cuadro de texto")
                      return
                    }
                    parseCsvText(pasteData)
                    setFileName("Datos pegados manualmente")
                    setPresetActivo("personalizado")
                  }}
                  disabled={!pasteData.trim()}
                  className="w-full gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  Procesar Datos Pegados
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Opcional: Cargar Datos de Prueba */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-dashed bg-muted/20 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="size-4 shrink-0 text-primary" />
              <span>¿Deseas probar la calculadora con un archivo de prueba anterior?</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => cargarPreset("octubre")}
              >
                Cargar Sem. 26/10 (RD$ 7,044.86)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => cargarPreset("noviembre")}
              >
                Cargar Sem. 02/11 (RD$ 8,959.59)
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
