import { Column, Row, Stack } from './sdk/layout.js'
import { Text, Image, Button } from './sdk/ui.js'

export const MyScreen = () => (
  <Column padding={16} backgroundColor="#F5F5F5">
    <Row justifyContent="space-between" alignItems="center">
      <Text>Welcome</Text>
      <Image src="avatar.png" width={40} height={40} cornerRadius={20} />
    </Row>

    <Stack marginVertical={20}>
      <Image src="background.png" cornerRadius={8} />
      <Button position="absolute" bottom={10} right={10}>
        Learn More
      </Button>
    </Stack>
  </Column>
)
