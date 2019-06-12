import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IRssWebPartProps {
  description: string;
  context: WebPartContext;
  feedNum: number;
}

export interface IXmlList {
  title: string;
  description: string;
  author: string;
  link: string;
  imgLink: string;
  source: string;
  date: Date;
}
