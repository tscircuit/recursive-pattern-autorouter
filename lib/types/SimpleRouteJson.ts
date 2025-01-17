export interface RouteWire {
  route_type: "wire"
  x: number
  y: number
  width: number
  layer: string
}

export interface RouteVia {
  route_type: "via"
  from_layer: string
  to_layer: string
  x: number
  y: number
}

export interface Trace {
  route: Array<RouteWire | RouteVia>
}

export type Obstacle = {
  type: "rect"
  layers: string[]
  center: { x: number; y: number }
  width: number
  height: number
  connectedTo: string[]
}

export interface PointWithLayer2 {
  x: number
  y: number
  l: number
}

export interface PointWithLayer {
  x: number
  y: number
  layer: string
  pcb_port_id?: string
}

export interface SimpleRouteConnection {
  name: string
  pointsToConnect: Array<PointWithLayer>
}

export interface ConnectionWithGoalAlternatives extends SimpleRouteConnection {
  startPoint: PointWithLayer
  endPoint: PointWithLayer
  goalBoxes: Obstacle[]
}

export interface SimpleRouteJson {
  layerCount: number
  minTraceWidth: number
  obstacles: Obstacle[]
  connections: Array<SimpleRouteConnection | ConnectionWithGoalAlternatives>
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  traces?: Trace[]
}
