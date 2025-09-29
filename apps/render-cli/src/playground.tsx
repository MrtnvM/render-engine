import { Column, Row, Stack, Text, Image, Button, Spacer } from './sdk/ui/index.js'

export const SCENARIO_KEY = 'playground-example'

export const MyScreen = () => (
  <Column style={{ padding: 16, backgroundColor: '#F5F5F5' }}>
    <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Text properties={{ text: 'Welcome' }} style={{ fontSize: 16, fontWeight: 'bold' }} />
      <Image properties={{ source: 'avatar.png' }} style={{ width: 40, height: 40, borderRadius: '20px' }} />
    </Row>

    <Spacer properties={{ size: 20 }} />

    <Stack style={{ marginVertical: 20, position: 'relative' }}>
      <Image properties={{ source: 'background.png' }} style={{ borderRadius: '8px' }} />
      <Button properties={{ title: 'Learn More' }} style={{ position: 'absolute', bottom: 10, right: 10 }} />
    </Stack>

    <Spacer style={{ flex: 1 }} />

    <Row style={{ justifyContent: 'center' }}>
      <Text properties={{ text: 'Footer Content' }} style={{ fontSize: 12, color: '#666' }} />
    </Row>
  </Column>
)
