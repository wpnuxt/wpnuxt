/**
 * Block types for WordPress Gutenberg blocks
 */

export interface EditorBlock {
  __typename?: string
  name?: string | null
  clientId?: string | null
  parentClientId?: string | null
  renderedHtml?: string | null
  attributes?: Record<string, unknown> | null
  innerBlocks?: (EditorBlock | null)[] | null
}

export interface CoreParagraph extends EditorBlock {
  __typename?: 'CoreParagraph'
  attributes?: {
    content?: string | null
    anchor?: string | null
    className?: string | null
    fontSize?: string | null
    textColor?: string | null
    style?: string | null
  } | null
}

export interface CoreHeading extends EditorBlock {
  __typename?: 'CoreHeading'
  attributes: {
    content?: string | null
    level: number
    anchor?: string | null
    className?: string | null
    fontSize?: string | null
    textColor?: string | null
  }
}

export interface CoreImage extends EditorBlock {
  __typename?: 'CoreImage'
  attributes?: {
    url?: string | null
    alt?: string | null
    width?: number | null
    height?: number | null
    scale?: string | null
    caption?: string | null
    className?: string | null
  } | null
}

export interface CoreButton extends EditorBlock {
  __typename?: 'CoreButton'
  attributes: {
    url?: string | null
    text?: string | null
    linkTarget?: string | null
    rel?: string | null
    style?: string | null
    fontSize?: string | null
    className?: string | null
    cssClassName?: string | null
    metadata?: string | null
  }
}

export interface CoreButtons extends EditorBlock {
  __typename?: 'CoreButtons'
  innerBlocks?: (CoreButton | null)[] | null
}

export interface CoreQuote extends EditorBlock {
  __typename?: 'CoreQuote'
  innerBlocks?: (CoreParagraph | null)[] | null
}

export interface CoreGallery extends EditorBlock {
  __typename?: 'CoreGallery'
  innerBlocks?: (CoreImage | null)[] | null
}

export interface CoreSpacer extends EditorBlock {
  __typename?: 'CoreSpacer'
  attributes?: {
    spacerHeight?: string | null
    spacerWidth?: string | null
    className?: string | null
  } | null
}

export interface NodeWithEditorBlocksFragment {
  editorBlocks?: (EditorBlock | null)[] | null
}
