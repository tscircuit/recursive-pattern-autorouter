import type { PointWithLayer, SimpleRouteJson } from "lib/types/SimpleRouteJson"

interface Props {
  A: PointWithLayer
  B: PointWithLayer

  simpleRouteJson: SimpleRouteJson

  onChangeSimpleRouteJson?: (json: SimpleRouteJson) => void
  onChangeA?: (point: PointWithLayer) => void
  onChangeB?: (point: PointWithLayer) => void
}
export const InteractiveAutorouter = ({}: Props) => {
  // TODO
  return null
}
