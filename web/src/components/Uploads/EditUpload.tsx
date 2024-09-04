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
  type Body_uploads_update_upload,
  type UploadOut,
  UploadsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import FileUpload from "../Common/FileUpload"

interface EditUploadProps {
  upload: UploadOut
  isOpen: boolean
  onClose: () => void
}

const EditUpload = ({ upload, isOpen, onClose }: EditUploadProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, errors, isDirty, isValid },
    watch,
  } = useForm<Body_uploads_update_upload>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: { ...upload, chunk_size: 500, chunk_overlap: 50 },
  })

  const updateUpload = async (data: Body_uploads_update_upload) => {
    return await UploadsService.updateUpload({
      id: upload.id,
      formData: data,
      contentLength: data.file?.size || 0,
    })
  }

  const mutation = useMutation(updateUpload, {
    onSuccess: (data) => {
      showToast("Success!", "Upload updated successfully.", "success")
      reset(data) // reset isDirty after updating
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

  const onSubmit: SubmitHandler<Body_uploads_update_upload> = async (data) => {
    mutation.mutate(data)
  }

  const onCancel = () => {
    reset()
    onClose()
  }

  const isUpdatingFile = !!watch("file")

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
          <ModalHeader>Edit Upload</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isInvalid={!!errors.name}>
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
            <FormControl isInvalid={!!errors.description} mt={4}>
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
              placeholder="Your file"
              control={control}
            >
              Upload File
            </FileUpload>
            <Controller
              control={control}
              name="chunk_size"
              rules={{ required: isUpdatingFile }}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { error },
              }) => (
                <FormControl
                  mt={4}
                  isRequired={isUpdatingFile}
                  isInvalid={!!error}
                >
                  <FormLabel htmlFor="temperature">Chunk Size</FormLabel>
                  <NumberInput
                    id="chunk_size"
                    isDisabled={!isUpdatingFile}
                    name={name}
                    value={value ?? 500}
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
              rules={{ required: isUpdatingFile }}
              render={({
                field: { onChange, onBlur, value, name, ref },
                fieldState: { error },
              }) => (
                <FormControl
                  mt={4}
                  isRequired={isUpdatingFile}
                  isInvalid={!!error}
                >
                  <FormLabel htmlFor="temperature">Chunk Overlap</FormLabel>
                  <NumberInput
                    id="chunk_overlap"
                    isDisabled={!isUpdatingFile}
                    name={name}
                    value={value ?? 50}
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
              isDisabled={!isDirty || !isValid}
            >
              Save
            </Button>
            <Button onClick={onCancel}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default EditUpload
