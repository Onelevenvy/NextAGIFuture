import {
  Input,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
  Icon,
} from "@chakra-ui/react"
import { FiFile } from "react-icons/fi"
import { type Control, useController } from "react-hook-form"
import { type ReactNode, useRef } from "react"

interface FileUploadProps {
  name: string
  placeholder?: string
  acceptedFileTypes: string
  control: Control<any, any>
  children?: ReactNode
  isRequired?: boolean
}

export const FileUpload = ({
  name,
  placeholder,
  acceptedFileTypes,
  control,
  children,
  isRequired = false,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    field: { ref, onChange, value, ...inputProps },
    fieldState: { invalid },
  } = useController({
    name,
    control,
    rules: { required: isRequired },
  })

  return (
    <FormControl isInvalid={invalid} isRequired={isRequired} mt={4}>
      <FormLabel htmlFor="writeUpFile">{children}</FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiFile} />
        </InputLeftElement>
        <input
          type="file"
          onChange={(e) => e.target.files && onChange(e.target.files[0])}
          accept={acceptedFileTypes}
          ref={inputRef}
          {...inputProps}
          style={{ display: "none" }}
        />
        <Input
          placeholder={placeholder || "Your file ..."}
          onClick={() => inputRef?.current?.click()}
          readOnly={true}
          value={value?.name || ""}
        />
      </InputGroup>
      <FormErrorMessage>{invalid}</FormErrorMessage>
    </FormControl>
  )
}

FileUpload.defaultProps = {
  acceptedFileTypes: "",
  allowMultipleFiles: false,
}

export default FileUpload
