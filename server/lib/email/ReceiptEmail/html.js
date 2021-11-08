const fs = require('fs');
const ExchangeRateAPI = require('../../ExchangeRate-Api');

const exchangeRateAPI = new ExchangeRateAPI();
const Currency = require('../../currency');

const currency = new Currency(exchangeRateAPI);

//change names from alias items to order.blabla
const html = (alias, items, totalQty, totalPrice, fee) => {
  console.log('p');
  return `
<html lang="en">
  <head>
    \n<\!--[if gte mso 9]>\n
    <xml
      >\n
      <o:OfficeDocumentsettings
        >\n <o:AllowPNG />\n <o:PixelsPerInch>96</o:PixelsPerInch>\n </o:OfficeDocumentsettings
      >\n
    </xml>
    \n
    <![endif]-->
    \n
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    \n
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    \n
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    \n
    <meta name="format-detection" content="address=no" />
    \n
    <meta name="format-detection" content="telephone=no" />
    \n
    <meta name="format-detection" content="email=no" />
    \n
    <meta name="x-apple-disable-message-reformatting" />
    \n<\!--[if !mso]><\!-->\n
    <style type="text/css">
      @import url('https://static.mailerlite.com/assets/plugins/groot/modules/includes/groot_fonts/import.css?version=1636021');
    </style>
    \n<\!--
    <![endif]-->
    \n\n<\!--[if mso]>\n
    <style type="text/css">
      \n    .content-MS .content img { width: 560px; }\n
    </style>
    \n
    <![endif]-->
    \n\n<\!--[if (mso)|(mso 16)]>\n
    <style type="text/css">
      \n    .mlContentButton a { text-decoration: none; }\n
    </style>
    \n
    <![endif]-->
    \n<\!--[if !mso]><\!-- -->\n<\!--
    <![endif]-->
    \n<\!--[if (lt mso 16)]>\n
    <style type="text/css" if="variable.bodyBackgroundImage.value">
      \n    .mlBodyBackgroundImage { background-image: none; }\n
    </style>
    \n
    <![endif]-->
    \n
    <style type="text/css">
      \n    .ReadMsgBody { width: 100%; }\n    .ExternalClass{ width: 100%; }\n    .ExternalClass * { line-height: 100%; }\n    .ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font { line-height:100%; }\n    body { margin: 0; padding: 0; }\n    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }\n    table td { border-collapse: collapse; }\n    table { border-spacing: 0; border-collapse: collapse; }\n    p, a, li, td, blockquote { mso-line-height-rule: exactly; }\n    p, a, li, td, body, table, blockquote { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }\n    img, a img { border: 0; outline: none; text-decoration: none; }\n    img { -ms-interpolation-mode: bicubic; }\n    * img[tabindex="0"] + div { display: none !important; }\n    a[href^=tel],a[href^=sms],a[href^=mailto], a[href^=date] { color: inherit; cursor: pointer; text-decoration: none; }\n    a[x-apple-data-detectors]{ color: inherit!important; text-decoration: none!important; font-size: inherit!important; font-family: inherit!important; font-weight: inherit!important; line-height: inherit!important; }\n    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }\n    #MessageViewBody { width: 100% !important; }\n    #MessageWebViewDiv { width: 100% !important; }\n\n    @-moz-document url-prefix() {\n      .bodyText p a, .bodyTitle p a {\n        word-break: break-word;\n      }\n    }\n\n    @media screen {\n      body {\n      font-family: 'Poppins', sans-serif;\n    }\n    * {\n    direction: ltr;\n    }\n    }\n\n    @media only screen and (min-width:768px){\n      .mlEmailContainer{\n        width: 640px!important;\n      }\n    }\n\n    @media only screen and (max-width: 640px) {\n      .mlTemplateContainer {\n        padding: 10px 10px 0 10px;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlTemplateContainer{\n        padding: 10px 10px 0 10px;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentCenter{\n        min-width: 10%!important;\n        margin: 0!important;\n        float: none!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentTable{\n        width: 100%!important;\n        min-width: 10%!important;\n        margin: 0!important;\n        float: none!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentBlock{\n        display: block !important;\n        width: 100%!important;\n        min-width: 10%!important;\n        margin: 0!important;\n        float: none!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentOuter{\n        padding-bottom: 0px!important;\n        padding-left: 15px!important;\n        padding-right: 15px!important;\n        padding-top: 0px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentOuterSmall{\n        padding-bottom: 0px!important;\n        padding-left: 10px!important;\n        padding-right: 10px!important;\n        padding-top: 0px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlMenuOuter{\n        padding-bottom: 0px!important;\n        padding-left: 5px!important;\n        padding-right: 5px!important;\n        padding-top: 0px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentOuterFullBig{\n        padding: 30px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentImage img {\n        height: auto!important;\n        width: 100%!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentImage160 img {\n        height: auto!important;\n        max-width: 160px;\n        width: 100%!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentImage260 img {\n        height: auto!important;\n        max-width: 260px;\n        width: 100%!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentImage{\n        height: 100%!important;\n        width: auto!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlProductImage{\n        height: auto!important;\n        width: 100%!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentButton a{\n        display: block!important;\n        width: auto!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-20{\n        height: 10px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-30{\n        height: 15px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-40{\n        height: 20px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-50{\n        height: 25px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-60{\n        height: 30px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-70{\n        height: 35px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-80{\n        height: 40px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-90{\n        height: 45px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingHeight-100{\n        height: 50px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingWidth-20{\n        width: 10px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingWidth-30{\n        width: 15px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingWidth-40{\n        width: 20px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .spacingWidth-60{\n        width: 30px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mobileHide{\n        display: none!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mobileShow{\n        display: block!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .alignCenter{\n        height: auto!important;\n        text-align: center!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .alignCenter img{\n        display: inline !important;\n        text-align: center!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .marginBottom{\n        margin-bottom: 15px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .marginTop {\n        margin-top: 10px !important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentHeight{\n        height: auto!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlDisplayInline {\n        display: inline-block!important;\n        float: none!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlNoFloat{\n        float: none!important;\n        margin-left: auto!important;\n        margin-right: auto!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentSurvey{\n        float: none!important;\n        margin-bottom: 10px!important;\n        width:100%!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .mlContentSurvey td a{\n        width: auto!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .multiple-choice-item-table{\n        width: 100% !important;\n        margin-bottom: 20px !important;\n        min-width: 10% !important;\n        float: none !important;\n      }\n    } @media only screen and (max-width: 640px) {\n      body{\n        margin: 0px!important;\n        padding: 0px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      body, table, td, p, a, li, blockquote{\n        -webkit-text-size-adjust: none!important;\n      }\n    }\n    @media only screen and (max-width: 480px){\n      .social-LinksTable{\n        width: 100%!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .social-LinksTable td:first-child{\n        padding-left: 0px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .social-LinksTable td:last-child{\n        padding-right: 0px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .social-LinksTable td{\n        padding: 0 10px!important;\n      }\n    } @media only screen and (max-width: 640px) {\n      .social-LinksTable td img{\n        height: auto!important;\n        max-width: 48px;\n        width: 100%!important;\n      }\n    }\n\n    /* Carousel style */\n\n    @media screen and (-webkit-min-device-pixel-ratio: 0) {\n      .webkit {\n        display: block !important;\n      }\n    }  @media screen and (-webkit-min-device-pixel-ratio: 0) {\n      .non-webkit {\n        display: none !important;\n      }\n    }  @media screen and (-webkit-min-device-pixel-ratio: 0) {\n      /* TARGET OUTLOOK.COM */\n      [class="x_non-webkit"] {\n        display: block !important;\n      }\n    }  @media screen and (-webkit-min-device-pixel-ratio: 0) {\n      [class="x_webkit"] {\n        display: none !important;\n      }\n    }\n\n
    </style>
    \n<\!--[if mso]>\n
    <style type="text/css">
      \n    .bodyText { font-family: Arial, Helvetica, sans-serif!important ; }\n    .bodyText * { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyText a { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyText a span { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyText span { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyText p { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyText ul li { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyTitle { font-family: Arial, Helvetica, sans-serif!important ; }\n    .bodyTitle * { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyTitle a { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyTitle a span { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyTitle span { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyTitle p { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyFont { font-family: Arial, Helvetica, sans-serif!important ; }\n    .bodyFont * { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyFont a { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyFont a span { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyFont span { font-family: Arial, Helvetica, sans-serif!important; }\n    .bodyFont p { font-family: Arial, Helvetica, sans-serif!important; }\n    .mlContentButton { font-family: Arial, Helvetica, sans-serif!important; }\n
    </style>
    \n
    <![endif]-->
    \n
    <style type="text/css">
      \n\t\t\t\t@media only screen and (max-width: 640px){\n\t\t\t\t\t#logoBlock-4 {\n\t\t\t\t\t\tmax-width: 210px!important;\n\t\t\t\t\t\twidth: 100%!important;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t
    </style>
    
    <style type="text/css">
      @media only screen and (max-width: 640px){ 
        .itemInfo{    padding-bottom: 1em!important;
        border-bottom: 1px solid lightgrey!important;} 
        .itemInfo:first-of-type {
        padding-top: 1em!important; border-top: 1px solid lightgrey!important;
      } 
      .itemImage{
width:50px!important;
      }
      .itemDescription{
        width:100%!important;
      }
      .itemData{
        width:100%!important;
      }
      
    }
    
    </style>
    
    <style type="text/css">
      \n\t\t\t\t@media only screen and (max-width: 640px){\n\t\t\t\t\t#imageBlock-14 img {\n\t\t\t\t\t\tmax-width: 868px!important;\n\t\t\t\t\t\twidth: 100%!important;\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t
    </style>
    <title>creating template</title>
    <meta name="robots" content="noindex, nofollow" /></head
  >\n
  <body
    class="mlBodyBackground vsc-initialized"
    style="
      padding: 0;
      margin: 0;
      -webkit-font-smoothing: antialiased;
      background-color: #f6f8f9;
      -webkit-text-size-adjust: none;
    "
  >
    \n\n
    <div role="article" aria-roledescription="email" aria-label="creating+template">
      \n<\!--[if !mso]><\!-- -->\n
      <table
        width="100%"
        border="0"
        cellspacing="0"
        cellpadding="0"
        bgcolor="#f6f8f9"
        class="mainTable mlBodyBackground"
        dir="ltr"
        background=""
      >
        \n

        <tbody>
          <tr>
            \n
            <td class="mlTemplateContainer" align="center">
              \n<\!--<![endif]-->\n<\!--[if mso 16]>\n
              <table width="100%" border="0" cellspacing="0" cellpadding="0" align="center">
                \n
                <tr>
                  \n
                  <td bgcolor="#f6f8f9" align="center">
                    \n <\!--<![endif]-->\n\n\n\n
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      width="640"
                      style="width: 640px; min-width: 640px;"
                      class="mobileHide"
                    >
                      \n
                      <tbody>
                        <tr>
                          \n
                          <td align="center">
                            \n
                            <table
                              cellpadding="0"
                              cellspacing="0"
                              border="0"
                              align="center"
                              width="640"
                              style="width: 640px; min-width: 640px;"
                              class="mlContentTable"
                            >
                              \n
                              <tbody>
                                <tr>
                                  \n
                                  <td colspan="2" height="20"></td>
                                  \n
                                </tr>
                                \n
                                <tr>
                                  \n
                                  <td
                                    align="left"
                                    style="
                                      font-family: 'Poppins', sans-serif;
                                      color: #111111;
                                      font-size: 12px;
                                      line-height: 18px;
                                    "
                                  >
                                    \n
                                  </td>
                                  \n\n
                                </tr>
                                \n
                                <tr>
                                  \n
                                  <td colspan="2" height="20"></td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            \n
                          </td>
                          \n
                        </tr>
                        \n
                      </tbody>
                    </table>
                    \n
                    <table
                      align="center"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      class="mlContentTable"
                      width="640"
                    >
                      \n
                      <tbody>
                        <tr>
                          \n
                          <td>
                            \n\n
                            <table
                              align="center"
                              border="0"
                              bgcolor="#ffffff"
                              class="mlContentTable mlContentTableDefault"
                              cellpadding="0"
                              cellspacing="0"
                              width="640"
                            >
                              \n
                              <tbody>
                                <tr>
                                  \n
                                  <td class="mlContentTableCardTd">
                                    \n
                                    <table
                                      align="center"
                                      bgcolor="#ffffff"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="mlContentTable ml-default"
                                      style="width: 640px; min-width: 640px;"
                                      width="640"
                                    >
                                      \n
                                      <tbody>
                                        <tr>
                                          \n
                                          <td>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="40"
                                                    class="spacingHeight-40"
                                                    style="line-height: 40px; min-height: 40px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    align="center"
                                                    style="padding: 0px 40px;"
                                                    class="mlContentOuter"
                                                  >
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="center"
                                                      width="100%"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td align="center">
                                                            \n<img
                                                              src="https://bucket.mlcdn.com/a/2355/2355557/images/e6e86cad64e87e378b55b563377f1e508a3e1a51.png"
                                                              id="logoBlock-4"
                                                              border="0"
                                                              alt=""
                                                              width="210"
                                                              style="display: block;"
                                                            />\n
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="30"
                                                    class="spacingHeight-30"
                                                    style="line-height: 30px; min-height: 30px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                          </td>
                                          \n
                                        </tr>
                                        \n
                                      </tbody>
                                    </table>
                                    \n
                                  </td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            \n\n\n
                            <table
                              align="center"
                              border="0"
                              bgcolor="#ffffff"
                              class="mlContentTable mlContentTableDefault"
                              cellpadding="0"
                              cellspacing="0"
                              width="640"
                            >
                              \n
                              <tbody>
                                <tr>
                                  \n
                                  <td class="mlContentTableCardTd">
                                    \n
                                    <table
                                      align="center"
                                      bgcolor="#ffffff"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="mlContentTable ml-default"
                                      style="width: 640px; min-width: 640px;"
                                      width="640"
                                    >
                                      \n
                                      <tbody>
                                        <tr>
                                          \n
                                          <td>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="20"
                                                    class="spacingHeight-20"
                                                    style="line-height: 20px; min-height: 20px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    align="center"
                                                    style="padding: 0px 40px;"
                                                    class="mlContentOuter"
                                                  >
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="center"
                                                      width="100%"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td
                                                            align="center"
                                                            class="bodyTitle"
                                                            style="
                                                              font-family: 'Poppins', sans-serif;
                                                              font-size: 28px;
                                                              font-weight: 700;
                                                              line-height: 150%;
                                                              color: #409cff;
                                                              text-transform: none;
                                                              font-style: normal;
                                                              text-decoration: none;
                                                              text-align: center;
                                                            "
                                                          >
                                                            Thank you for your purchase!
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                          </td>
                                          \n
                                        </tr>
                                        \n
                                      </tbody>
                                    </table>
                                    \n
                                  </td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            \n\n\n
                            <table
                              align="center"
                              border="0"
                              bgcolor="#ffffff"
                              class="mlContentTable mlContentTableDefault"
                              cellpadding="0"
                              cellspacing="0"
                              width="640"
                            >
                              \n
                              <tbody>
                                <tr>
                                  \n
                                  <td class="mlContentTableCardTd">
                                    \n
                                    <table
                                      align="center"
                                      bgcolor="#ffffff"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="mlContentTable ml-default"
                                      style="width: 640px; min-width: 640px;"
                                      width="640"
                                    >
                                      \n
                                      <tbody>
                                        <tr>
                                          \n
                                          <td>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="10"
                                                    class="spacingHeight-10"
                                                    style="line-height: 10px; min-height: 10px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    align="center"
                                                    style="padding: 0px 40px;"
                                                    class="mlContentOuter"
                                                  >
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="center"
                                                      width="100%"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td
                                                            class="bodyTitle"
                                                            id="bodyText-8"
                                                            style="
                                                              font-family: 'Poppins', sans-serif;
                                                              font-size: 14px;
                                                              line-height: 150%;
                                                              color: #6f6f6f;
                                                            "
                                                          >
                                                            <p
                                                              style="
                                                                margin-top: 0px;
                                                                margin-bottom: 0px;
                                                                line-height: 150%;
                                                                text-align: center;
                                                              "
                                                            >
                                                              You purchased ${
                                                                totalQty === 1
                                                                  ? 'a WishTender'
                                                                  : 'WishTenders'
                                                              } for
                                                              <a
                                                                href="https://www.wishtender.com/${
                                                                  alias.handle
                                                                }"
                                                                style="
                                                                  word-break: break-word;
                                                                  font-family: 'Poppins', sans-serif;
                                                                  color: #09c269;
                                                                  text-decoration: underline;
                                                                "
                                                                >${alias.aliasName}</a
                                                              ><br />
                                                            </p>
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="40"
                                                    class="spacingHeight-40"
                                                    style="line-height: 40px; min-height: 40px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                          </td>
                                          \n
                                        </tr>
                                        \n
                                      </tbody>
                                    </table>
                                    \n
                                  </td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            \n\n\n
                            <table
                              align="center"
                              border="0"
                              bgcolor="#ffffff"
                              class="mlContentTable mlContentTableDefault"
                              cellpadding="0"
                              cellspacing="0"
                              width="640"
                            >
                              \n<tbody>
                              <tr>
                                \n
                                <td class="mlContentTableCardTd">
                                  \n
                                  <table
                                    align="center"
                                    bgcolor="#ffffff"
                                    border="0"
                                    cellpadding="0"
                                    cellspacing="0"
                                    class="mlContentTable ml-default"
                                    style="width: 640px; min-width: 640px;"
                                    width="640"
                                  >
                                    \n
                              ${
                                totalQty === 1
                                  ? `
                                      <tbody>
                                        <tr>
                                          \n
                                          <td>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="20"
                                                    class="spacingHeight-20"
                                                    style="line-height: 20px; min-height: 20px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    align="center"
                                                    style="padding: 0px 40px;"
                                                    class="mlContentOuter"
                                                  >
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="center"
                                                      width="100%"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td align="center" id="imageBlock-10">
                                                            <img
                                                              src="${items[0].item.itemImage}"
                                                              border="0"
                                                              width="200"
                                                              style="display: block;"
                                                            />
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td
                                                            height="20"
                                                            class="spacingHeight-20"
                                                          ></td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td
                                                            height="20"
                                                            class="spacingHeight-20"
                                                          ></td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td
                                                            align="left"
                                                            class="bodyTitle"
                                                            id="bodyText-10"
                                                            style="
                                                              font-family: 'Poppins', sans-serif;
                                                              font-size: 14px;
                                                              line-height: 150%;
                                                              color: #6f6f6f;
                                                            "
                                                          >
                                                            <p
                                                              style="
                                                                margin-top: 0px;
                                                                margin-bottom: 0px;
                                                                line-height: 150%;
                                                                text-align: center;
                                                              "
                                                            >
                                                              ${items[0].item.itemName}
                                                            </p>
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td
                                                            height="20"
                                                            class="spacingHeight-20"
                                                          ></td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td align="center">
                                                            \n
                                                            <table
                                                              role="presentation"
                                                              cellpadding="0"
                                                              border="0"
                                                              align="center"
                                                              width="50%"
                                                              class="mlContentTable"
                                                            >
                                                              \n
                                                              <tbody>
                                                                <tr>
                                                                  \n
                                                                  <td
                                                                    width="100%"
                                                                    align="center"
                                                                    class="bodyTitle"
                                                                    style="
                                                                      font-family: 'Poppins',
                                                                        sans-serif;
                                                                      font-size: 13px;
                                                                      font-weight: 700;
                                                                      line-height: 150%;
                                                                      color: #111111;
                                                                    "
                                                                  >
                                                                    ${items[0].price}
                                                                  </td>
                                                                  \n
                                                                </tr>
                                                                \n
                                                              </tbody>
                                                            </table>
                                                            \n
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n


              
                                                        
                                                      <tr>
                                                        <td align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500; line-height: 150%; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">Fee: ${fee}</td>
                                                      </tr>
                                                    
                                                      
                                                      <tr>
                                                        <td height="20" class="spacingHeight-20"></td>
                                                      </tr>
                                                      <tr>
                                                        <td align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; line-height: 150%; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">Total</td>
                                                      </tr>
                                                      <tr>
                                                        <td height="20" class="spacingHeight-20"></td>
                                                      </tr>
                                                      
                                                      <tr>
                                                      <td align="center">
                                            
                                                        <table role="presentation" cellpadding="0" border="0" align="center" width="50%" class="mlContentTable">
                                                          <tbody><tr>
                                                            <td width="100%" align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; line-height: 150%; color: #111111;">${totalPrice}</td>
                                                            
                                                            
                                                          </tr>
                                                        </tbody></table>
                                            
                                                      </td>
                                                    </tr>
                                                        <tr>
                                                          \n
                                                          <td
                                                            height="30"
                                                            class="spacingHeight-30"
                                                          ></td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td align="center">
                                                            \n
                                                            <table
                                                              role="presentation"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              width="100%"
                                                              style="width: 100%; min-width: 100%;"
                                                            >
                                                              \n
                                                              <tbody>
                                                                <tr>
                                                                  \n
                                                                  <td
                                                                    align="center"
                                                                    class="mlContentButton"
                                                                    style="
                                                                      font-family: 'Poppins',
                                                                        sans-serif;
                                                                    "
                                                                  >
                                                                    \n<\!--[if
                                                                    mso]>\n\t\t\t\t\t\t\t\t\t<v:roundrect
                                                                      xmlns:v="urn:schemas-microsoft-com:vml"
                                                                      xmlns:w="urn:schemas-microsoft-com:office:word"
                                                                      href="http://www.wishtender.com"
                                                                      style="
                                                                        height: 50px;
                                                                        v-text-anchor: middle;
                                                                        width: 229px;
                                                                      "
                                                                      arcsize="6%"
                                                                      stroke="f"
                                                                      fillcolor="#2d8cff"
                                                                      >\n\t\t\t\t\t\t\t\t\t<w:anchorlock />\n\t\t\t\t\t\t\t\t\t
                                                                      <center>
                                                                        \n\t\t\t\t\t\t\t\t\t<![endif]-->\n<a
                                                                          class="mlContentButton"
                                                                          href="https://www.wishtender.com/${alias.handle}"
                                                                          style="
                                                                            font-family: 'Poppins',
                                                                              sans-serif;
                                                                            background-color: #2d8cff;
                                                                            border-radius: 3px;
                                                                            color: #ffffff;
                                                                            display: inline-block;
                                                                            font-size: 14px;
                                                                            font-weight: 400;
                                                                            line-height: 20px;
                                                                            padding: 15px 0 15px 0;
                                                                            text-align: center;
                                                                            text-decoration: none;
                                                                            width: 220px;
                                                                          "
                                                                          >Visit ${alias.aliasName}'s Wishlist</a
                                                                        >\n<\!--[if
                                                                        mso]>\n\t\t\t\t\t\t\t\t\t
                                                                      </center>
                                                                      \n\t\t\t\t\t\t\t\t\t</v:roundrect
                                                                    >\n\t\t\t\t\t\t\t\t\t<![endif]-->\n
                                                                  </td>
                                                                  \n
                                                                </tr>
                                                                \n
                                                              </tbody>
                                                            </table>
                                                            \n
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>  
                                              
                                            </table>
                                         

                                       
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="20"
                                                    class="spacingHeight-20"
                                                    style="line-height: 20px; min-height: 20px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                          </td>
                                          \n
                                        </tr>
                                        \n
                                      </tbody>
                                    </table>
                                    \n
                                  </td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            `
                                  : `<table role="presentation" cellpadding="10" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                  <tbody><tr>
                                    <td align="center" style="padding: 0px 40px;" class="mlContentOuter">
                                
                                      <table role="presentation" cellpadding="10" cellspacing="0" border="0" align="center" width="100%">
                                        <tbody><tr>
                                          <td align="center" id="imageBlock-10" 
                                >
                                
                                
                                ${items
                                  .map(
                                    (
                                      item
                                    ) => `<table class="itemInfo" cellpadding="10"style="width:100%;"><tbody><tr><td>
                                    
                                    <table class ="itemData" cellpadding="10" align="left"><tbody><tr style="padding:1em; width:100%;
                            " >
                            <td><img class="itemImage"src="${
                              item.item.itemImage
                            }" border="0"  style="display: block; width:70px;">
                            </td>
                                
                            <td align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 12px;  line-height: 150%; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">${
                              item.price
                            }</td> 
                            <td align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 12px;  line-height: 150%; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">QTY: ${
                              item.qty
                            }</td> </tr></tbody></table>
                            <table class = "itemDescription" align="right" style="width:260px;"><tbody><tr><td align="left" class="bodyTitle" id="bodyText-10" style="font-family: 'Poppins', sans-serif; font-size: 14px; line-height: 150%; color: #6f6f6f;"><p style="margin-top: 0px; margin-bottom: 0px; line-height: 150%; ">${`${item.item.itemName.slice(
                              0,
                              50
                            )}...`}</p></td></tr></tbody></table> 
                            
                            </td></tr></tbody></table> 
                            
                                `
                                  )
                                  .join('')}
                                
                                
                                                                
                                </td>
                                        </tr> </table><table>
                                        
                                        
                                        <tr>
                                          <td height="20" class="spacingHeight-20"></td>
                                        </tr>
                                        <tr>
                                          <td align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500; line-height: 150%; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">Fee: ${fee}</td>
                                        </tr>
                                     
                                        
                                        <tr>
                                          <td height="20" class="spacingHeight-20"></td>
                                        </tr>
                                        <tr>
                                          <td align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 18px; font-weight: 700; line-height: 150%; color: #111111; text-transform: none; font-style: normal; text-decoration: none; text-align: center;">Total</td>
                                        </tr>
                                        <tr>
                                          <td height="20" class="spacingHeight-20"></td>
                                        </tr>

                                        <tr>
                                        <td align="center">
                              
                                          <table role="presentation" cellpadding="0" border="0" align="center" width="50%" class="mlContentTable">
                                            <tbody><tr>
                                              <td width="100%" align="center" class="bodyTitle" style="font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; line-height: 150%; color: #111111;">${totalPrice}</td>
                                              
                                              
                                            </tr>
                                          </tbody></table>
                              
                                        </td>
                                      </tr>
                                    
                                        </tr>
                                        <tr>
                                          <td height="30" class="spacingHeight-30"></td>
                                        </tr>
                                        <tr>
                                          <td align="center">
                                
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; min-width: 100%;">
                                              <tbody><tr>
                                                <td align="center" class="mlContentButton" style="font-family: 'Poppins', sans-serif;">
                                                  <!--[if mso]>
                                                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="http://www.wishtender.com" style="height:50px;v-text-anchor:middle;width:229px;" arcsize="6%" stroke="f" fillcolor="#2d8cff">
                                                  <w:anchorlock/>
                                                  <center>
                                                  <![endif]-->
                                                    <a class="mlContentButton" href="http://www.wishtender.com" style="font-family: 'Poppins', sans-serif; background-color: #2d8cff; border-radius: 3px; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 400; line-height: 20px; padding: 15px 0 15px 0; text-align: center; text-decoration: none; width: 220px;">Visit Lumie's Wishlist</a>
                                                  <!--[if mso]>
                                                  </center>
                                                  </v:roundrect>
                                                  <![endif]-->
                                                </td>
                                                
                                                
                                              </tr>
                                            </tbody></table>
                                          </td>
                                        </tr>
                                      </tbody></table>
                                
                                      
                                
                                      
                                    </td>
                                  </tr>
                                </tbody></table>`
                              }
                            \n\n\n
                            <table
                              align="center"
                              border="0"
                              bgcolor="#ffffff"
                              class="mlContentTable mlContentTableDefault"
                              cellpadding="0"
                              cellspacing="0"
                              width="640"
                            >
                              \n
                              <tbody>
                                <tr>
                                  \n
                                  <td class="mlContentTableCardTd">
                                    \n
                                    <table
                                      align="center"
                                      bgcolor="#ffffff"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="mlContentTable ml-default"
                                      style="width: 640px; min-width: 640px;"
                                      width="640"
                                    >
                                      \n
                                      <tbody>
                                        <tr>
                                          \n
                                          <td>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="20"
                                                    class="spacingHeight-20"
                                                    style="line-height: 20px; min-height: 20px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td align="center" class="">
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="center"
                                                      width="100%"
                                                      style="
                                                        border-top: 1px solid #ededf3;
                                                        border-collapse: initial;
                                                      "
                                                      class=""
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td
                                                            height="20"
                                                            class="spacingHeight-20"
                                                            style="
                                                              line-height: 20px;
                                                              min-height: 20px;
                                                            "
                                                          ></td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                          </td>
                                          \n
                                        </tr>
                                        \n
                                      </tbody>
                                    </table>
                                    \n
                                  </td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            \n\n\n
                            <table
                              align="center"
                              border="0"
                              bgcolor="#ffffff"
                              class="mlContentTable mlContentTableDefault"
                              cellpadding="0"
                              cellspacing="0"
                              width="640"
                            >
                              \n
                              <tbody>
                                <tr>
                                  \n
                                  <td class="mlContentTableCardTd">
                                    \n
                                    <table
                                      align="center"
                                      bgcolor="#ffffff"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="mlContentTable ml-default"
                                      style="width: 640px; min-width: 640px;"
                                      width="640"
                                    >
                                      \n
                                      <tbody>
                                        <tr>
                                          \n
                                          <td>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="20"
                                                    class="spacingHeight-20"
                                                    style="line-height: 20px; min-height: 20px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    align="center"
                                                    style="padding: 0px 40px;"
                                                    class="mlContentOuter"
                                                  >
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="left"
                                                      width="270"
                                                      style="width: 270px; min-width: 270px;"
                                                      class="mlContentTable marginBottom"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td align="center" id="imageBlock-14">
                                                            <img
                                                              src="https://bucket.mlcdn.com/a/2355/2355557/images/0925db5be5b05861ff509ed6ee6601f6d8d3830c.png"
                                                              border="0"
                                                              width="270"
                                                              style="display: block;"
                                                            />
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="right"
                                                      width="267"
                                                      style="width: 267px; min-width: 267px;"
                                                      class="mlContentTable marginBottom"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td
                                                            align="center"
                                                            class="bodyTitle"
                                                            style="
                                                              font-family: 'Poppins', sans-serif;
                                                              font-size: 18px;
                                                              font-weight: 700;
                                                              line-height: 150%;
                                                              color: #111111;
                                                              text-transform: none;
                                                              font-style: normal;
                                                              text-decoration: none;
                                                              text-align: left;
                                                            "
                                                          >
                                                            Questions? FeedBack?
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td
                                                            height="20"
                                                            class="spacingHeight-20"
                                                          ></td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td
                                                            align="left"
                                                            class="bodyTitle"
                                                            id="bodyText-14"
                                                            style="
                                                              font-family: 'Poppins', sans-serif;
                                                              font-size: 14px;
                                                              line-height: 150%;
                                                              color: #6f6f6f;
                                                            "
                                                          >
                                                            <p
                                                              style="
                                                                margin-top: 0px;
                                                                margin-bottom: 0px;
                                                                line-height: 150%;
                                                              "
                                                            >
                                                              Hey! I'm, Dash, the founder of
                                                              WishTender. I'm always open to
                                                              questions, feature requests, feedback,
                                                              or just saying "hello!" Schedule a
                                                              time to live&nbsp;chat or reply to
                                                              this email with your thoughts.&nbsp;I
                                                              love meeting users!<br />
                                                            </p>
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td
                                                            height="30"
                                                            class="spacingHeight-30"
                                                          ></td>
                                                          \n
                                                        </tr>
                                                        \n
                                                        <tr>
                                                          \n
                                                          <td align="center">
                                                            \n
                                                            <table
                                                              role="presentation"
                                                              border="0"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              width="100%"
                                                              style="width: 100%; min-width: 100%;"
                                                            >
                                                              \n
                                                              <tbody>
                                                                <tr>
                                                                  \n
                                                                  <td
                                                                    align="left"
                                                                    class="mlContentButton"
                                                                    style="
                                                                      font-family: 'Poppins',
                                                                        sans-serif;
                                                                    "
                                                                  >
                                                                    \n<\!--[if
                                                                    mso]>\n\t\t\t\t\t\t\t\t\t<v:roundrect
                                                                      xmlns:v="urn:schemas-microsoft-com:vml"
                                                                      xmlns:w="urn:schemas-microsoft-com:office:word"
                                                                      href="https://calendly.com/dashiell/20min"
                                                                      style="
                                                                        height: 50px;
                                                                        v-text-anchor: middle;
                                                                        width: 149px;
                                                                      "
                                                                      arcsize="6%"
                                                                      stroke="f"
                                                                      fillcolor="#2d8cff"
                                                                      >\n\t\t\t\t\t\t\t\t\t<w:anchorlock />\n\t\t\t\t\t\t\t\t\t
                                                                      <center>
                                                                        \n\t\t\t\t\t\t\t\t\t<![endif]-->\n<a
                                                                          class="mlContentButton"
                                                                          href="https://calendly.com/dashiell/20min"
                                                                          style="
                                                                            font-family: 'Poppins',
                                                                              sans-serif;
                                                                            background-color: #2d8cff;
                                                                            border-radius: 3px;
                                                                            color: #ffffff;
                                                                            display: inline-block;
                                                                            font-size: 14px;
                                                                            font-weight: 400;
                                                                            line-height: 20px;
                                                                            padding: 15px 0 15px 0;
                                                                            text-align: center;
                                                                            text-decoration: none;
                                                                            width: 150px;
                                                                          "
                                                                          >Schedule A Chat</a
                                                                        >\n<\!--[if
                                                                        mso]>\n\t\t\t\t\t\t\t\t\t
                                                                      </center>
                                                                      \n\t\t\t\t\t\t\t\t\t</v:roundrect
                                                                    >\n\t\t\t\t\t\t\t\t\t<![endif]-->\n
                                                                  </td>
                                                                  \n
                                                                </tr>
                                                                \n
                                                              </tbody>
                                                            </table>
                                                            \n
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="20"
                                                    class="spacingHeight-20"
                                                    style="line-height: 20px; min-height: 20px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                          </td>
                                          \n
                                        </tr>
                                        \n
                                      </tbody>
                                    </table>
                                    \n
                                  </td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            \n\n


                            <table align="center" border="0" bgcolor="#ffffff" class="mlContentTable mlContentTableDefault" cellpadding="0" cellspacing="0" width="640">
                              

                            <tbody>
                              <tr>
                                

                                <td class="mlContentTableCardTd">
                                  

                                  <table align="center" bgcolor="#ffffff" border="0" cellpadding="0" cellspacing="0" class="mlContentTable ml-default" style="width: 640px; min-width: 640px;" width="640">
                                    

                                    <tbody>
                                      <tr>
                                        

                                        <td>
                                          

                                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                            

                                            <tbody>
                                              <tr>
                                                

                                                <td height="20" class="spacingHeight-20" style="line-height: 20px; min-height: 20px;"></td>
                                                

                                              </tr>
                                              

                                            </tbody>
                                          </table>
                                          

                                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="640" style="width: 640px; min-width: 640px;" class="mlContentTable">
                                            

                                            <tbody>
                                              <tr>
                                                

                                                <td align="center" class="">
                                                  

                                                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="
                                                      border-top: 1px solid #ededf3;
                                                      border-collapse: initial;
                                                    " class="">
                                                    

                                                    <tbody>
                                                      <tr>
                                                        

                                                        <td height="20" class="spacingHeight-20" style="
                                                            line-height: 20px;
                                                            min-height: 20px;
                                                          "></td>
                                                        

                                                      </tr>
                                                      

                                                    </tbody>
                                                  </table>
                                                  

                                                </td>
                                                

                                              </tr>
                                              

                                            </tbody>
                                          </table>
                                          

                                        </td>
                                        

                                      </tr>
                                      

                                    </tbody>
                                  </table>
                                  

                                </td>
                                

                              </tr>
                              

                            </tbody>
                          </table>

                            <table
                              align="center"
                              border="0"
                              bgcolor="#ffffff"
                              class="mlContentTable mlContentTableFooterDefault"
                              cellpadding="0"
                              cellspacing="0"
                              width="640"
                            >
                              \n
                              <tbody>
                                <tr>
                                  \n
                                  <td class="mlContentTableFooterCardTd">
                                    \n
                                    <table
                                      align="center"
                                      bgcolor="#ffffff"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="mlContentTable ml-default"
                                      style="width: 640px; min-width: 640px;"
                                      width="640"
                                    >
                                      \n
                                      <tbody>
                                        <tr>
                                          \n
                                          <td>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="30"
                                                    class="spacingHeight-30"
                                                    style="line-height: 30px; min-height: 30px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    align="center"
                                                    style="padding: 0px 40px;"
                                                    class="mlContentOuter"
                                                  >
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="center"
                                                      width="100%"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td
                                                            align="left"
                                                            class="bodyTitle"
                                                            style="
                                                              font-family: 'Poppins', sans-serif;
                                                              font-size: 14px;
                                                              font-weight: 700;
                                                              line-height: 150%;
                                                              color: #111111;
                                                            "
                                                          >
                                                            WishTender
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td height="10" class="spacingHeight-10"></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    align="center"
                                                    style="padding: 0px 40px;"
                                                    class="mlContentOuter"
                                                  >
                                                    \n
                                                    <table
                                                      role="presentation"
                                                      cellpadding="0"
                                                      cellspacing="0"
                                                      border="0"
                                                      align="center"
                                                      width="100%"
                                                    >
                                                      \n
                                                      <tbody>
                                                        <tr>
                                                          \n
                                                          <td align="center">
                                                            \n
                                                            <table
                                                              role="presentation"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              border="0"
                                                              align="left"
                                                              width="267"
                                                              style="
                                                                width: 267px;
                                                                min-width: 267px;
                                                              "
                                                              class="mlContentTable marginBottom"
                                                            >
                                                              \n
                                                              <tbody>
                                                                <tr>
                                                                  \n
                                                                  <td
                                                                    align="left"
                                                                    class="bodyTitle"
                                                                    id="footerText-16"
                                                                    style="
                                                                      font-family: 'Poppins',
                                                                        sans-serif;
                                                                      font-size: 12px;
                                                                      line-height: 150%;
                                                                      color: #111111;
                                                                    "
                                                                  >
                                                                    <p
                                                                      style="
                                                                        margin-top: 0px;
                                                                        margin-bottom: 0px;
                                                                      "
                                                                    >
                                                                      Chicago,&nbsp;IL
                                                                    </p>
                                                                  </td>
                                                                  \n
                                                                </tr>
                                                                \n
                                                                <tr>
                                                                  \n
                                                                  <td
                                                                    height="25"
                                                                    class="spacingHeight-20"
                                                                  ></td>
                                                                  \n
                                                                </tr>
                                                                \n
                                                                <tr>
                                                                  \n
                                                                  <td align="center">
                                                                    \n
                                                                    <table
                                                                      role="presentation"
                                                                      cellpadding="0"
                                                                      cellspacing="0"
                                                                      border="0"
                                                                      align="left"
                                                                    >
                                                                      \n
                                                                      <tbody>
                                                                        <tr>
                                                                          \n
                                                                          <td
                                                                            align="center"
                                                                            width="24"
                                                                            style="
                                                                              padding: 0px 5px;
                                                                            "
                                                                            ng-show="slink.link != ''"
                                                                          >
                                                                            \n<a
                                                                              href="https://twitter.com/WishTender"
                                                                              target="_self"
                                                                              >\n<img
                                                                                width="24"
                                                                                alt="twitter"
                                                                                src="https://cdn.mailerlite.com/images/icons/default/round/black/twitter.png"
                                                                                style="
                                                                                  display: block;
                                                                                "
                                                                                border="0"
                                                                              />\n</a
                                                                            >\n
                                                                          </td>
                                                                          <td
                                                                            align="center"
                                                                            width="24"
                                                                            style="
                                                                              padding: 0px 5px;
                                                                            "
                                                                            ng-show="slink.link != ''"
                                                                          >
                                                                            \n<a
                                                                              href="https://instagram.com/wishtenderapp"
                                                                              target="_self"
                                                                              >\n<img
                                                                                width="24"
                                                                                alt="instagram"
                                                                                src="https://cdn.mailerlite.com/images/icons/default/round/black/instagram.png"
                                                                                style="
                                                                                  display: block;
                                                                                "
                                                                                border="0"
                                                                              />\n</a
                                                                            >\n
                                                                          </td>
                                                                          <td
                                                                            align="center"
                                                                            width="24"
                                                                            style="
                                                                              padding: 0px 5px;
                                                                            "
                                                                            ng-show="slink.link != ''"
                                                                          >
                                                                            \n<a
                                                                              href="https://www.tiktok.com/@wishtender"
                                                                              target="_self"
                                                                              >\n<img
                                                                                width="24"
                                                                                alt="tiktok"
                                                                                src="https://cdn.mailerlite.com/images/icons/default/round/black/tiktok.png"
                                                                                style="
                                                                                  display: block;
                                                                                "
                                                                                border="0"
                                                                              />\n</a
                                                                            >\n
                                                                          </td>
                                                                          \n
                                                                        </tr>
                                                                        \n
                                                                      </tbody>
                                                                    </table>
                                                                    \n
                                                                  </td>
                                                                  \n
                                                                </tr>
                                                                \n
                                                              </tbody>
                                                            </table>
                                                            \n
                                                            <table
                                                              role="presentation"
                                                              cellpadding="0"
                                                              cellspacing="0"
                                                              border="0"
                                                              align="right"
                                                              width="267"
                                                              style="
                                                                width: 267px;
                                                                min-width: 267px;
                                                              "
                                                              class="mlContentTable"
                                                            >
                                                              \n
                                                              <tbody>
                                                                \n
                                                                <tr>
                                                                  \n
                                                                  <td height="10"></td>
                                                                  \n
                                                                </tr>
                                                                \n\n
                                                              </tbody>
                                                            </table>
                                                            \n
                                                          </td>
                                                          \n
                                                        </tr>
                                                        \n
                                                      </tbody>
                                                    </table>
                                                    \n
                                                  </td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                            <table
                                              role="presentation"
                                              cellpadding="0"
                                              cellspacing="0"
                                              border="0"
                                              align="center"
                                              width="640"
                                              style="width: 640px; min-width: 640px;"
                                              class="mlContentTable"
                                            >
                                              \n
                                              <tbody>
                                                <tr>
                                                  \n
                                                  <td
                                                    height="40"
                                                    class="spacingHeight-40"
                                                    style="line-height: 40px; min-height: 40px;"
                                                  ></td>
                                                  \n
                                                </tr>
                                                \n
                                              </tbody>
                                            </table>
                                            \n
                                          </td>
                                          \n
                                        </tr>
                                        \n
                                      </tbody>
                                    </table>
                                    \n
                                  </td>
                                  \n
                                </tr>
                                \n
                              </tbody>
                            </table>
                            \n
                          </td>
                          \n
                        </tr>
                        \n
                      </tbody>
                    </table>
                    \n
                    <table
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      align="center"
                      width="640"
                      style="width: 640px; min-width: 640px;"
                      class="mlContentTable"
                    >
                      \n
                      <tbody>
                        <tr>
                          \n
                          <td height="40" class="spacingHeight-20"></td>
                          \n
                        </tr>
                        \n\n
                        <tr>
                          \n
                          <td height="40" class="spacingHeight-20"></td>
                          \n
                        </tr>
                        \n
                      </tbody>
                    </table>
                    \n\n<\!--[if mso 16]>\n
                  </td>
                  \n
                </tr>
                \n
              </table>
              \n <\!--<![endif]-->\n<\!--[if !mso]><\!-- -->\n
            </td>
            \n
          </tr>
          \n
        </tbody>
      </table>
      \n<\!--<![endif]-->\n
    </div>
    \n\n
  </body>
</html>
`;
};

module.exports = html;
