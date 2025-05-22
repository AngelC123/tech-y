import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/productos - Starting request")

    // Query simple y directo como en empleados
    const query = "SELECT * FROM Producto ORDER BY `Nombre del producto` ASC"
    console.log("Executing query:", query)

    const productos = await executeQuery(query, [])
    console.log("Products found:", productos ? (productos as any[]).length : 0)

    if (productos && Array.isArray(productos) && productos.length > 0) {
      console.log("Sample product:", productos[0])
    }

    return NextResponse.json(productos || [])
  } catch (error) {
    console.error("Error in GET /api/productos:", error)
    return NextResponse.json(
      {
        error: "Error al obtener productos",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("POST /api/productos - Received data:", data)

    // Validar datos requeridos
    if (!data.codigo || !data.nombre || data.precio === undefined || data.stock === undefined || !data.tipo) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el código ya existe
    const existingProduct = await executeQuery("SELECT Codigo FROM Producto WHERE Codigo = ?", [data.codigo])
    if (Array.isArray(existingProduct) && existingProduct.length > 0) {
      return NextResponse.json({ error: "Ya existe un producto con este código" }, { status: 400 })
    }

    // Insertar nuevo producto
    await executeQuery(
      "INSERT INTO Producto (Codigo, `Nombre del producto`, `Precio unitario`, Cantidad, Tipo) VALUES (?, ?, ?, ?, ?)",
      [data.codigo, data.nombre, data.precio, data.stock, data.tipo],
    )

    return NextResponse.json({ success: true, message: "Producto creado correctamente" })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
