"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft } from "lucide-react"

interface Producto {
  Codigo: string
  Nombre: string
  "Precio unitario": number
}

export default function AgregarProductoPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [loading, setLoading] = useState(false)
  const [productos, setProductos] = useState<Producto[]>([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [codigoProducto, setCodigoProducto] = useState("")
  const [cantidad, setCantidad] = useState("1")
  const router = useRouter()
  const { toast } = useToast()

  // Cargar productos disponibles
  useEffect(() => {
    async function fetchProductos() {
      try {
        setLoadingProductos(true)
        const response = await fetch("/api/productos")
        if (!response.ok) {
          throw new Error("Error al cargar productos")
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          setProductos(data)
        } else {
          setProductos([])
        }
      } catch (error) {
        console.error("Error fetching productos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
      } finally {
        setLoadingProductos(false)
      }
    }

    fetchProductos()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigoProducto || !cantidad) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`/api/tickets/${id}/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Codigo_Producto: codigoProducto,
          Cantidad: Number.parseInt(cantidad),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error al agregar producto: ${response.status} ${errorText}`)
      }

      toast({
        title: "Éxito",
        description: "Producto agregado correctamente",
      })

      // Redirigir a la página de detalles del ticket
      router.push(`/admin/tickets/${id}`)
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mr-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Agregar Producto al Ticket #{id}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="producto">Producto</Label>
                {loadingProductos ? (
                  <p>Cargando productos...</p>
                ) : (
                  <Select onValueChange={setCodigoProducto} value={codigoProducto}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos.map((producto) => (
                        <SelectItem key={producto.Codigo} value={producto.Codigo}>
                          {producto.Nombre} - ${producto["Precio unitario"]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ingrese la cantidad"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || loadingProductos}>
                {loading ? "Agregando..." : "Agregar Producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
