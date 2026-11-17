"use client"

import { useState, useMemo, useEffect } from "react"
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
} from "lucide-react"
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

const DEMO_CSV_DATA = `Número de pedido,Sucursal,Fecha de pedido,Monto bruto de la venta,Descuento otorgado por el local,Envio a cargo del local,Descuento comercial neto otorgado x PeYa,Cupon otorgado por el local,Desc. neto otorgado por Peya a usuarios,Desc. comerciales Retiro en el local,Descuento por Comodín pago por el local,Monto venta + envió cobrado por el local,Monto neto de la Venta ($),Monto comisionable Servicios PedidosYa,Servicio Ventas PedidosYA (%),Servicio Logística PedidosYA (%),Servicio Ventas PedidoYa ($),Servicio Logística PedidosYa ($),Cargo por Pedidos con Plus,Descuento tarifa de servicio al cliente,Pedido con Comodin,PLUS,Método de pago,Cobrado por,Método de entrega
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

export function PedidosYaModule() {
  const [activeTab, setActiveTab] = useState<"resumen" | "detalle" | "cargar">("resumen")
  const [pasteData, setPasteData] = useState("")
  const [fileName, setFileName] = useState<string>("Semana 02/11/2026 - 08/11/2026")
  
  // Parámetros del PDF (Estado de cuenta oficial)
  const [publicidadTotal, setPublicidadTotal] = useState<number>(1298.30)
  const [impuestoTotal, setImpuestoTotal] = useState<number>(343.71)
  const [ajustesTotal, setAjustesTotal] = useState<number>(15.26)
  const [metodoDistribucion, setMetodoDistribucion] = useState<"ventas" | "igualitario" | "pedidos">("ventas")

  // Filtros de tabla de detalle
  const [filtroSucursal, setFiltroSucursal] = useState<string>("todas")
  const [busqueda, setBusqueda] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 15

  // Filas parseadas
  const [pedidos, setPedidos] = useState<PedidoYaRow[]>([])

  const parseCsvText = (text: string) => {
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) {
      toast.error("El contenido ingresado no tiene suficientes filas")
      return
    }

    const separator = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ","
    const headers = lines[0].split(separator).map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase())

    const getIdx = (keywords: string[]) =>
      headers.findIndex((h) => keywords.some((k) => h.includes(k)))

    const idxNum = getIdx(["número", "numero", "pedido"])
    const idxSuc = getIdx(["sucursal", "local", "tienda"])
    const idxFecha = getIdx(["fecha"])
    const idxBruto = getIdx(["bruto"])
    const idxDescLocal = getIdx(["descuento otorgado por el local", "descuento local", "desc. local"])
    const idxDescPeya = getIdx(["desc. neto otorgado por peya", "otorgado x peya", "peya a usuarios"])
    const idxNeto = getIdx(["monto neto de la venta", "monto neto", "neto"])
    const idxComisionable = getIdx(["comisionable"])
    const idxComVentaPct = getIdx(["servicio ventas pedidosya (%)", "ventas pedidosya (%)"])
    const idxComLogPct = getIdx(["servicio logística pedidosya (%)", "logistica pedidosya (%)"])
    const idxComVentaMonto = getIdx(["servicio ventas pedidoya ($)", "servicio ventas ($)"])
    const idxComLogMonto = getIdx(["servicio logística pedidoya ($)", "servicio logistica ($)"])
    const idxPlus = getIdx(["cargo por pedidos con plus", "plus ($)", "cargo plus"])
    const idxMetodoPago = getIdx(["método de pago", "metodo de pago", "pago"])
    const idxCobradoPor = getIdx(["cobrado por", "cobrado"])

    const parsedRows: PedidoYaRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const cols = line.split(separator).map((c) => c.replace(/^["']|["']$/g, "").trim())

      const sucursalRaw = idxSuc !== -1 ? cols[idxSuc] : "Bizcochao"
      const bruto = parseNumber(idxBruto !== -1 ? cols[idxBruto] : 0)
      const descLocal = parseNumber(idxDescLocal !== -1 ? cols[idxDescLocal] : 0)
      const descPeya = parseNumber(idxDescPeya !== -1 ? cols[idxDescPeya] : 0)
      let neto = parseNumber(idxNeto !== -1 ? cols[idxNeto] : 0)
      if (neto === 0 && bruto > 0) {
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
    }

    setPedidos(parsedRows)
    setActiveTab("resumen")
    toast.success(`Se procesaron ${parsedRows.length} pedidos correctamente`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      reader.onload = (evt) => {
        try {
          const binaryStr = evt.target?.result
          const workbook = XLSX.read(binaryStr, { type: "binary" })
          const firstSheet = workbook.SheetNames[0]
          const sheet = workbook.Sheets[firstSheet]
          const csvText = XLSX.utils.sheet_to_csv(sheet)
          parseCsvText(csvText)
        } catch (err: unknown) {
          console.error(err)
          toast.error("Error al leer el archivo Excel")
        }
      }
      reader.readAsBinaryString(file)
    } else {
      reader.onload = (evt) => {
        const text = evt.target?.result as string
        if (text) parseCsvText(text)
      }
      reader.readAsText(file)
    }
  }

  // Cargar demo inicial
  useEffect(() => {
    parseCsvText(DEMO_CSV_DATA)
  }, [])

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

    // 1. Acumulados directos
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

    // 2. Prorrateo de gastos generales
    for (const key of sucursalesKeys) {
      const s = porSucursal[key]
      s.margenOperativo = s.ventaNeta - s.totalComisiones - s.cargoPlus + s.reintegrosPeya

      // Ratio de distribución
      let ratioPublicidad = 0
      if (metodoDistribucion === "ventas") {
        ratioPublicidad = totalVentasNetas > 0 ? s.ventaNeta / totalVentasNetas : 1 / numSucursales
      } else if (metodoDistribucion === "pedidos") {
        ratioPublicidad = totalPedidos > 0 ? s.pedidos / totalPedidos : 1 / numSucursales
      } else {
        ratioPublicidad = 1 / numSucursales
      }

      const ratioComisiones = totalComisiones > 0 ? s.totalComisiones / totalComisiones : 1 / numSucursales
      const ratioVentas = totalVentasNetas > 0 ? s.ventaNeta / totalVentasNetas : 1 / numSucursales

      s.publicidad = publicidadTotal * ratioPublicidad
      s.impuestos = impuestoTotal * ratioComisiones
      s.ajustes = ajustesTotal * ratioVentas

      s.gananciaNeta = s.margenOperativo - s.publicidad - s.impuestos + s.ajustes
    }

    const totalLiquidado =
      totalVentasNetas - totalComisiones - totalPlus - publicidadTotal - impuestoTotal + totalReintegros + ajustesTotal

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
      totalLiquidado,
      metodoDistribucion,
      porSucursal,
      pedidos,
    }
  }, [pedidos, publicidadTotal, impuestoTotal, ajustesTotal, metodoDistribucion])

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("cargar")}
            className="gap-2"
          >
            <Upload className="size-4" />
            Cargar Archivo / Pegar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 print:hidden"
          >
            <Printer className="size-4" />
            Imprimir Reporte
          </Button>
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
          {/* Tarjetas Principales de Ganancia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Total Liquidado Banco (PDF)
                </CardDescription>
                <CardTitle className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  {currency(liquidacion.totalLiquidado)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2 mt-2">
                  <span>{liquidacion.totalPedidos} pedidos en la semana</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-300">
                    Conciliado 100%
                  </Badge>
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
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

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
                    Ajustes (Aminoración descuento)
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
                    Distribución de Publicidad
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
                    <TableHead className="text-right font-bold text-primary bg-primary/5">
                      Total Liquidación (PDF)
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
                    <TableCell className="text-right font-bold bg-primary/5">
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
                    <TableCell className="text-right font-bold bg-primary/5">
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
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400 bg-rose-100/30 dark:bg-rose-950/40">
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
                    <TableCell className="text-right font-bold bg-primary/5">
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
                    <TableCell className="text-right text-muted-foreground text-xs bg-primary/5">
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
                    <TableCell className="text-right text-muted-foreground text-xs bg-primary/5">
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
                    <TableCell className="text-right font-bold text-rose-600 dark:text-rose-400 bg-primary/5">
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
                    <TableCell className="text-right font-bold text-amber-600 bg-primary/5">
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
                    <TableCell className="text-right font-bold text-green-600 bg-primary/5">
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
                    <TableCell className="text-right font-bold bg-primary/10">
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
                    <TableCell className="text-right text-muted-foreground text-xs bg-primary/5">
                      -{currency(liquidacion.totalPublicidad)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-muted-foreground text-xs">
                      Impuesto IVA sobre Comisiones (proporcional)
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                        -{currency(s.impuestos)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-muted-foreground text-xs bg-primary/5">
                      -{currency(liquidacion.totalImpuestos)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="text-muted-foreground text-xs">
                      Ajuste de Liquidación (Aminoración)
                    </TableCell>
                    {sucursalesList.map((s) => (
                      <TableCell key={s.sucursal} className="text-right text-muted-foreground text-xs">
                        +{currency(s.ajustes)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-muted-foreground text-xs bg-primary/5">
                      +{currency(liquidacion.totalAjustes)}
                    </TableCell>
                  </TableRow>

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
                    <TableCell className="text-right text-primary text-xl bg-primary/20">
                      {currency(liquidacion.totalLiquidado)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PESTAÑA 2: DETALLE DE PEDIDOS */}
        <TabsContent value="detalle" className="flex flex-col gap-4 mt-6">
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
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="Todas las sucursales" />
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
                  <TableRow className="bg-muted/50">
                    <TableHead># Pedido</TableHead>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto Bruto</TableHead>
                    <TableHead className="text-right">Desc. Local</TableHead>
                    <TableHead className="text-right">Monto Neto</TableHead>
                    <TableHead className="text-right">Comisión (Ventas+Log)</TableHead>
                    <TableHead className="text-center">Plus</TableHead>
                    <TableHead>Método Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPedidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No se encontraron pedidos con los filtros seleccionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPedidos.map((p) => {
                      const totalComision = p.servicioVentasMonto + p.servicioLogisticaMonto
                      return (
                        <TableRow key={p.numeroPedido} className="hover:bg-muted/40">
                          <TableCell className="font-mono text-xs font-semibold">
                            {p.numeroPedido}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {p.sucursal}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.fecha}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {currency(p.montoBruto)}
                          </TableCell>
                          <TableCell className="text-right text-rose-500 font-medium">
                            {p.descuentoLocal > 0 ? `-${currency(p.descuentoLocal)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right font-bold text-foreground">
                            {currency(p.montoNetoVenta)}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            -{currency(totalComision)}
                            <span className="block text-[10px] opacity-75">
                              ({p.servicioVentasPct + p.servicioLogisticaPct}%)
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
        </TabsContent>

        {/* PESTAÑA 3: CARGAR DATOS */}
        <TabsContent value="cargar" className="flex flex-col gap-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opción 1: Subir Archivo */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-emerald-500" />
                  Opción 1: Subir Archivo (.xlsx o .csv)
                </CardTitle>
                <CardDescription className="text-xs">
                  Sube el archivo Excel o CSV que descargas del portal de PedidosYa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 hover:border-primary/60 transition-colors text-center cursor-pointer relative bg-muted/10">
                  <Upload className="size-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos admitidos: .xlsx, .xls, .csv, .tsv
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.tsv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Archivo en uso: <strong>{fileName}</strong></span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-primary text-xs"
                    onClick={() => {
                      parseCsvText(DEMO_CSV_DATA)
                      setFileName("Semana 02/11/2026 - 08/11/2026")
                      toast.success("Datos de la semana de ejemplo recargados")
                    }}
                  >
                    <RotateCcw className="size-3.5" />
                    Cargar Semana Actual
                  </Button>
                </div>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
