import React from 'react';

export const AdBanner: React.FC = () => {
  const iframeSrcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: transparent;
            overflow: hidden;
          }
        </style>
        <script type="text/javascript" src="https://pl30803264.effectivecpmnetwork.com/43/18/84/431884863983179d40ae147c2af3ae48.js"></script>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '54eb33908e3c59d4b718da233ad7a320',
            'format' : 'iframe',
            'height' : 60,
            'width' : 468,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/54eb33908e3c59d4b718da233ad7a320/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="w-full flex justify-center items-center my-3">
      <div className="bg-[#121214] border border-[#27272a] rounded-xl p-1.5 flex justify-center items-center overflow-hidden min-h-[68px] min-w-[320px] sm:min-w-[476px]">
        <iframe
          title="Anúncio Shuziro"
          srcDoc={iframeSrcDoc}
          width="468"
          height="60"
          className="border-0 overflow-hidden max-w-full"
          sandbox="allow-scripts allow-same-origin"
          scrolling="no"
        />
      </div>
    </div>
  );
};
