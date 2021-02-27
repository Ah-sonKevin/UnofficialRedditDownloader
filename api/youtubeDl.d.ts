declare module "youtube-dl" {
  export interface Info {
    id: string,
    title: string,
    url: string,
    size: string,
    thumbnail: string,
    description: string,
    filename: string,
    format_id: string
  }
}