import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react"
import { type SubmitHandler, useForm, Controller } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"

import {
  type ApiError,
  UploadsService,
  type Body_uploads_create_upload,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import FileUpload from "../Common/FileUpload"

interface AddUploadProps {
  isOpen: boolean
  onClose: () => void
}

const AddUpload = ({ isOpen, onClose }: AddUploadProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<Body_uploads_create_upload>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      chunk_size: 500,
      chunk_overlap: 50,
    },
  })

  const addUpload = async (data: Body_uploads_create_upload) => {
    await UploadsService.createUpload({
      formData: data,
      contentLength: data.file.size,
    })
  }

  const mutation = useMutation(addUpload, {
    onSuccess: () => {
      reset()
      onClose()
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries("uploads")
    },
  })

  const onSubmit: SubmitHandler<Body_uploads_create_upload> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>Add Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel htmlFor="name">Name</FormLabel>
              <Input
                id="name"
                {...register("name", {
                  pattern: {
                    value: /^[a-zA-Z0-9_-]{1,64}$/,
                    message: "Name must follow pattern: ^[a-zA-Z0-9_-]{1,64}$",
                  },
                })}
                type="text"
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.description} mt={4}>
              <FormLabel htmlFor="description">Description</FormLabel>
              <Input
                id="description"
                {...register("description")}
                placeholder="Description"
                type="text"
              />
            </FormControl>
            <FileUpload
              name="file"
              acceptedFileTypes="application/pdf"
              isRequired={true}
              placeholder="Your file"
              control={control}
            >
              Upload File
            </FileUpload>
            <Controller
              control={control}
              name="chunk_size"
              rules={{ required: true }}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { error },
              }) => (
                <FormControl mt={4} isRequired isInvalid={!!error}>
                  <FormLabel htmlFor="temperature">Chunk Size</FormLabel>
                  <NumberInput
                    id="chunk_size"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={ref}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="chunk_overlap"
              rules={{ required: true }}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { error },
              }) => (
                <FormControl mt={4} isRequired isInvalid={!!error}>
                  <FormLabel htmlFor="temperature">Chunk Overlap</FormLabel>
                  <NumberInput
                    id="chunk_overlap"
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={ref}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                </FormControl>
              )}
            />
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting || mutation.isLoading}
              isDisabled={!isValid || !isDirty}
            >
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default AddUpload
