export interface YamlNodeStyle {
  color?: string
  shape?: 'rectangle' | 'pill' | 'diamond'
}

export interface YamlNode {
  title: string
  content?: string
  link?: string
  style?: YamlNodeStyle
  children?: YamlNode[]
}
