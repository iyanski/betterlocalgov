import EditorJS, { API, OutputData } from '@editorjs/editorjs';
import { useEffect, useRef } from 'react';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import Table from '@editorjs/table';

export default function ContentEditor({
  onChange,
}: {
  onChange: (content: OutputData) => void;
}) {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: 'editorjs',
        placeholder: 'Start typing here...',
        /**
         * Available Tools list.
         * Pass Tool's class or Settings object for each Tool you want to use
         */
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: List,
          image: Image,
          code: Code,
          table: Table,
        },
        /**
         * Previously saved data that should be rendered
         */
        data: { blocks: [] },
        onReady: () => {
          console.log('Editor is ready');
        },
        onChange: async (api: API) => {
          api.saver
            .save()
            .then((data: OutputData) => {
              onChange(data);
            })
            .catch((error: Error) => {
              console.log('Saving failed: ', error);
            });
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="editorjs" className="w-full" data-gramm="false" />;
}
