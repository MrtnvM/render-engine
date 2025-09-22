// Maps React component names to their native 'type' in the JSON schema.
export const componentTypeMapping = {
  Row: 'row',
  Column: 'column',
  Stack: 'stack',
  Text: 'text',
  Image: 'image',
  Button: 'button',
}

// Maps React prop names to their corresponding key in the JSON 'style' or root object.
// We also define where the prop should go: 'style' or 'properties'.
export const propMapping = {
  // Style props
  width: { key: 'width', destination: 'style' },
  height: { key: 'height', destination: 'style' },
  padding: { key: 'padding', destination: 'style' },
  paddingHorizontal: { key: 'paddingHorizontal', destination: 'style' },
  paddingVertical: { key: 'paddingVertical', destination: 'style' },
  paddingTop: { key: 'paddingTop', destination: 'style' },
  paddingBottom: { key: 'paddingBottom', destination: 'style' },
  paddingLeft: { key: 'paddingLeft', destination: 'style' },
  paddingRight: { key: 'paddingRight', destination: 'style' },
  margin: { key: 'margin', destination: 'style' },
  marginHorizontal: { key: 'marginHorizontal', destination: 'style' },
  marginVertical: { key: 'marginVertical', destination: 'style' },
  marginTop: { key: 'marginTop', destination: 'style' },
  marginBottom: { key: 'marginBottom', destination: 'style' },
  marginLeft: { key: 'marginLeft', destination: 'style' },
  marginRight: { key: 'marginRight', destination: 'style' },
  backgroundColor: { key: 'bgColor', destination: 'style' },
  cornerRadius: { key: 'cornerRadius', destination: 'style' },
  borderWidth: { key: 'borderWidth', destination: 'style' },
  borderColor: { key: 'borderColor', destination: 'style' },
  justifyContent: { key: 'contentAlignment', destination: 'style' },
  alignItems: { key: 'alignItems', destination: 'style' },
  position: { key: 'position', destination: 'style' },
  top: { key: 'top', destination: 'style' },
  bottom: { key: 'bottom', destination: 'style' },
  left: { key: 'left', destination: 'style' },
  right: { key: 'right', destination: 'style' },
  textColor: { key: 'textColor', destination: 'style' },
  fontSize: { key: 'fontSize', destination: 'style' },
  fontWeight: { key: 'fontWeight', destination: 'style' },
  textAlign: { key: 'textAlign', destination: 'style' },
  resizeMode: { key: 'resizeMode', destination: 'style' },

  // Non-style properties
  id: { key: 'id', destination: 'properties' },
  children: { key: 'text', destination: 'properties' }, // TODO: DECIDE HOW TO HANDLE IT!!!!
  src: { key: 'source', destination: 'properties' }, // For Image
  title: { key: 'title', destination: 'properties' }, // For Button
  onPress: { key: 'onPress', destination: 'properties' }, // For Button
  numberOfLines: { key: 'numberOfLines', destination: 'properties' },
}
