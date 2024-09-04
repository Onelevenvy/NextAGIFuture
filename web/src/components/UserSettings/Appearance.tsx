import {
  Badge,
  Container,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  useColorMode,
} from "@chakra-ui/react"

const Appearance = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <>
      <Container maxW="full">
        <Heading size="sm" py={4}>
          显示模式
        </Heading>
        <RadioGroup onChange={toggleColorMode} value={colorMode}>
          <Stack>
            {/* TODO: Add system default option */}
            <Radio value="light" colorScheme="teal">
              浅色
              <Badge ml="1" colorScheme="teal">
                Default
              </Badge>
            </Radio>
            <Radio value="dark" colorScheme="teal">
            深色
            </Radio>
          </Stack>
        </RadioGroup>
      </Container>
    </>
  )
}
export default Appearance
