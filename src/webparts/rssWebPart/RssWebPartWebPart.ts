import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';

import * as strings from 'RssWebPartWebPartStrings';
import RssWebPart from './components/RssWebPart';
import { IRssWebPartProps } from './components/IRssWebPartProps';

export interface IRssWebPartWebPartProps {
  description: string;
  rssFeedProp: number;
}

export default class RssWebPartWebPart extends BaseClientSideWebPart<IRssWebPartWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IRssWebPartProps > = React.createElement(
      RssWebPart,
      {
        description: this.properties.description,
        context: this.context,
        feedNum: this.properties.rssFeedProp
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneSlider('rssFeedProp', { 
                  label: 'News feeds', 
                  min: 2, 
                  max: 12, 
                  step: 1, 
                  showValue: true, 
                  value: 5 
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
