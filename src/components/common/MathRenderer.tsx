/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content = '', className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Replace display math $$...$$
    let text = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return `$$${math}$$`;
      }
    });

    // Replace inline math $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return `$${math}$`;
      }
    });

    // Replace newlines with <br />
    text = text.replace(/\n/g, '<br />');

    return text;
  }, [content]);

  return (
    <div
      className={`leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
