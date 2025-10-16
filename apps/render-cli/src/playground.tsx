import { Column, Row, Stack, Text, Image, Button, Spacer } from '@render-engine/admin-sdk/ui'

export const SCENARIO = {
  key: 'playground-example',
  name: 'Playground Example',
  description: 'Example scenario for testing the render engine',
  version: '1.0.0'
}

export const MyScreen = () => (
  <Column style={{ padding: 16, backgroundColor: '#F5F5F5' }}>
    <Row style={{ justifyContent: 'spaceBetween', alignItems: 'center' }}>
      <Text properties={{ text: 'Welcome' }} style={{ fontSize: 16, fontWeight: 'bold' }} />
      <Image properties={{ source: 'avatar.png' }} style={{ width: 40, height: 40, borderRadius: 20 }} />
    </Row>

    <Spacer properties={{ size: 20 }} />

    <Stack style={{ marginVertical: 20, position: 'relative' }}>
      <Image properties={{ source: 'background.png' }} style={{ borderRadius: 8 }} />
      <Button properties={{ title: 'Learn More' }} style={{ position: 'absolute', bottom: 10, right: 10 }} />
    </Stack>

    <Spacer style={{ flexGrow: 1 }} />

    <Row style={{ justifyContent: 'center' }}>
      <Text properties={{ text: 'Footer Content' }} style={{ fontSize: 12, color: '#666' }} />
    </Row>
  </Column>
)
