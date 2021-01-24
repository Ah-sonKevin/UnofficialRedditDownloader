export interface rawItem {
  data: {
    children: {
      kind: string;
      data: unknown;
    }[];
    after: string;
  };
}
