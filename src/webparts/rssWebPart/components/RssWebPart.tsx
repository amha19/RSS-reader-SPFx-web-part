import * as React from 'react';
import styles from './RssWebPart.module.scss';
import { IRssWebPartProps } from './IRssWebPartProps';
import { IXmlList } from './IRssWebPartProps';
import { Guid } from "guid-typescript";
import { IHttpClientOptions, SPHttpClient, SPHttpClientResponse, ISPHttpClientOptions } from '@microsoft/sp-http';
import { IGetDataService, SPDataService } from './GetDataService';
import parse from 'html-react-parser';
import * as moment from 'moment';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Slider } from 'office-ui-fabric-react/lib/Slider';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

// import { IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';



export interface IRssWebPartState {
  title: string;
  description: string;
  author: string;
  link: string;
  imgLink: string;
  date: string;
  url: string;
  feedNum: number;
  showPanel: boolean;
  list: IXmlList[];
}

export default class RssApp extends React.Component<IRssWebPartProps, IRssWebPartState> {
  constructor(props: IRssWebPartProps) {
    super(props);

    this.state = {
      title: '',
      description: '',
      author: '',
      link: '',
      imgLink: '',
      date: '',
      url: this.props.description,
      feedNum: 3,
      showPanel: false,
      list: []
    }
  }

  componentDidMount() {
    this._fetchApiData();
    // this._getRssJson();    
  }

  private _fetchApiData = () => {

    let url = this.state.url;
    let proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    // let requestHeaders = new Headers();
    // requestHeaders.append('Accept', 'text/xml; application/xml');

    const requestGetOptions: IHttpClientOptions = {
      method: "GET",
      headers: new Headers(),
      mode: "cors"
    };

    fetch(proxyUrl + url, requestGetOptions)
      .then(results => {
        if (results.ok) {
          return results.text();
        } else {
          throw new Error('Network response was not ok.');
        }
      }).then(data => {
        // console.log("data: ", data);
        let parser = new DOMParser();
        let xml = parser.parseFromString(data, "text/xml");
        // console.log("xml: ", xml);
        let xmlList = [];
        let items = [];
        let length = this.state.feedNum + 2;
        // console.log("feedNum: ", this.props.feedNum);

        for (let i = 2; i < length; i++) {
          xmlList.push({
            title: xml.getElementsByTagName("title")[i].innerHTML,
            description: xml.getElementsByTagName("description")[i - 1].innerHTML,
            author: xml.getElementsByTagName("author")[i - 2].innerHTML,
            link: xml.getElementsByTagName("link")[i].innerHTML,
            source: xml.getElementsByTagName("title")[0].innerHTML,
            date: xml.getElementsByTagName("pubDate")[i - 2].innerHTML
          });
        }

        console.log("xmlList: ", xmlList);
        console.log("xml: ", xml);

        /** Loop through the parsed xml list and filter out what i need */
        for (let i = 0; i < (length - 2); i++) {

          /** Title */

          let fullTitle = xmlList[i].title;
          let feedTitle = fullTitle.replace(/&amp;/g, "&");

          /** Description */

          let desc = xmlList[i].description;
          let trimed1 = desc.substring(desc.indexOf('<p>'), desc.lastIndexOf('<'));          

          let parse = require('html-react-parser');
          let parsed = parse(trimed1);
          // console.log("parsed: ", parsed);

          /** Author */

          let uAuthor = xmlList[i].author;
          let author = uAuthor.substring(uAuthor.indexOf("(") + 1, uAuthor.lastIndexOf(")"));
          // console.log("author: ", author);

          /** image */

          let imageLink;
          if (desc.includes("img src=") == true) {
            imageLink = desc.substring(desc.indexOf("img src") + 9, desc.indexOf(".jpg") + 4);
          } else {
            imageLink = "https://www.expressen.se/images/wasp-for-sharing.png";
          }

          /** Date */

          let pDate = new Date(xmlList[i].date);
          let nDate = new Date();
          let setTime: string;          

          let tInMin = moment.utc(moment(nDate, "DD/MM/YYYY HH:mm:ss").diff(moment(pDate, "DD/MM/YYYY HH:mm:ss"))).format("mm");
          let tInHr = moment.utc(moment(nDate, "DD/MM/YYYY HH:mm:ss").diff(moment(pDate, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm");
          // console.log("nn: ", tInHr);
          let tSplit = tInHr.split(":");
          // console.log("tSplit: ", tSplit);
          let s1 = parseInt(tSplit[0]);

          s1 == 0 ? (setTime = tInMin) : (setTime = tInHr);   /**more options are needed here */

          this.setState({
            title: feedTitle,
            link: xmlList[i].link,
            description: parsed,
            author: author,
            imgLink: imageLink,
            date: setTime
          });

          // console.log("date: ", this.state.date);

          items.push({
            title: this.state.title,
            description: this.state.description,
            author: this.state.author,
            link: this.state.link,
            imgLink: this.state.imgLink,
            source: '',
            date: this.state.date
          });
        }

        this.setState({ list: items });
        console.log("items: ", items);
        console.log("List: ", this.state.list);

      });
  }

  /** Alternative method */
  private async _getRssJson(): Promise<any> {
    let service: IGetDataService;
    service = new SPDataService(this.props.context.httpClient, this.props.description);
    service.getData().then((result) => {
      console.log("result: ", result);
      let xmlList = [];
      let items = [];
      let length = this.props.feedNum + 2;
      // console.log("feedNum: ", this.props.feedNum);

      for (let i = 2; i < length; i++) {
        xmlList.push({
          title: result.getElementsByTagName("title")[i].innerHTML,
          description: result.getElementsByTagName("description")[i - 1].innerHTML,
          author: result.getElementsByTagName("author")[i - 2].innerHTML,
          link: result.getElementsByTagName("link")[i].innerHTML,
          source: result.getElementsByTagName("title")[0].innerHTML,
          date: result.getElementsByTagName("pubDate")[i - 2].innerHTML
        });
      }

      console.log("xmlList: ", xmlList);
      console.log("xml: ", result);

      /** Loop through the parsed xml list and filter out what i need */
      for (let i = 0; i < (length - 2); i++) {

        /** Title */

        let fullTitle = xmlList[i].title;
        let feedTitle = fullTitle.replace(/&amp;/g, "&");

        /** Description */

        let desc = xmlList[i].description;
        let trimed1 = desc.substring(desc.indexOf('<p>'), desc.lastIndexOf('<'));
        
        let parse = require('html-react-parser');
        let parsed = parse(trimed1);
        // console.log("parsed: ", parsed);

        /** Author */

        let uAuthor = xmlList[i].author;
        let author = uAuthor.substring(uAuthor.indexOf("(") + 1, uAuthor.lastIndexOf(")"));
        // console.log("author: ", author);

        /** image */

        let imageLink;
        if (desc.includes("img src=") == true) {
          imageLink = desc.substring(desc.indexOf("img src") + 9, desc.indexOf(".jpg") + 4);
        } else {
          imageLink = "https://www.expressen.se/images/wasp-for-sharing.png";
        }

        /** Date */

        let pDate = new Date(xmlList[i].date);
        let nDate = new Date();
        let setTime;


        let tInMin = moment.utc(moment(nDate, "DD/MM/YYYY HH:mm:ss").diff(moment(pDate, "DD/MM/YYYY HH:mm:ss"))).format("mm");
        let tInHr = moment.utc(moment(nDate, "DD/MM/YYYY HH:mm:ss").diff(moment(pDate, "DD/MM/YYYY HH:mm:ss"))).format("HH:mm");
        console.log("nn: ", tInHr);
        let tSplit = tInHr.split(":");
        console.log("tSplit: ", tSplit);
        let s1 = parseInt(tSplit[0]);

        s1 == 0 ? (setTime = tInMin) : (setTime = tInHr);

        this.setState({
          title: feedTitle,
          link: xmlList[i].link,
          description: parsed,
          author: author,
          imgLink: imageLink,
          date: setTime
        });

        // console.log("date: ", this.state.date);

        items.push({
          title: this.state.title,
          description: this.state.description,
          author: this.state.author,
          link: this.state.link,
          imgLink: this.state.imgLink,
          source: '',
          date: this.state.date
        });
      }

      this.setState({ list: items });
      console.log("items: ", items);
      console.log("List: ", this.state.list);
    })
  }

  /** Opens new window */
  private _goToPage = (link: string) => {
    window.open(link, '_blank');  
  }

  /**Toggle panel */
  private _openPanelAndHidePanel = () => {
    this.setState({ showPanel: !this.state.showPanel });
  }

  /**Reloads the page */
  private _reloadPage = () => {
    // window.location.reload(false);
    this._fetchApiData();
    this.setState({
      showPanel: !this.state.showPanel
    });
  }

  /**Sets the panel */
  private _setPanel = () => {
    this.setState({
      showPanel: true
    });
  }

  private _onRenderFooterContent = () => {
    return (
      <div>
        <DefaultButton onClick={this._reloadPage}>Apply</DefaultButton>
      </div>
    );
  }  

  public render(): React.ReactElement<IRssWebPartProps> {

    /** Text field */
    let textField = (
      <div>
        <TextField
          label="Url Field"
          placeholder={this.state.url}
          onChanged={e => { this.setState({ url: e }); }}
        /> <br></br><br />
        <Slider 
          label="Nyhetsflöden"
          min={2}
          max={10}
          step={1}
          defaultValue={this.state.feedNum}
          showValue={true}
          onChange={(value: number) => { this.setState({ feedNum: value }); }}
        />
      </div>
    )

    /** Panel */
    let editNewsPanel;
    this.state.showPanel ?
      editNewsPanel =
      <Panel
        isOpen={this.state.showPanel}
        type={PanelType.smallFixedFar}
        onDismiss={this._openPanelAndHidePanel}
        headerText={"Rss inställningar"}
        closeButtonAriaLabel="Close"
        onRenderFooterContent={this._onRenderFooterContent}>
        {textField}
      </Panel> : editNewsPanel = null;

    let newsBlock = this.state.list.map((result) => {

      let guid = Guid.create().toString();

      return (
        <div key={guid} className={styles.container}>
          <div className={styles.imgDiv} >
            <div className={styles.newsImg}>
              <img src={result.imgLink} alt="Expressen" style={{ width: 160, height: 70 }}></img>
            </div>
          </div>
          <div className={styles.textContainer} >
            <div className={styles.titleText} onClick={this._goToPage.bind(this, result.link)}>
              <h3>
                {result.title}
              </h3>
            </div>
            <div className={styles.descriptionText}>
              <p>
                {result.description}
              </p>
            </div>
            <div className={styles.autherAndTime}>
              <div className={styles.authorText}>
                <p >
                  {result.author}
                </p>
              </div>
              <div className={styles.timeText}>
                {result.date} sedan
              </div>
            </div>
          </div>
        </div>
      )
    });

    /** Renders rss feeds  */
    return (
      <div className={styles.rssApp}>
        {editNewsPanel}
        <div className={styles.nyheterOchIcon}>
          <div className={styles.nyheter}>
            <h1 style={{ paddingLeft: 8, fontStyle: "italic" }}>Nyheter</h1>
          </div>          
          <div style={{ position: "relative"}} className={styles.iconDiv}>
            <Icon styles={{ root: { fontSize: "28px", position: "absolute", color: "white", top: '-50px', left: '95%' } }}
            onClick={this._setPanel.bind(this)}  iconName="More" />
          </div>
        </div>
        {newsBlock}
      </div>
    );
  }
}

