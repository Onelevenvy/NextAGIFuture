import {
  Box,
  Button,
  Checkbox,
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
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Textarea,
  Tooltip,
} from "@chakra-ui/react";
import useCustomToast from "../../hooks/useCustomToast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  type ApiError,
  MembersService,
  type TeamUpdate,
  type MemberOut,
  type MemberUpdate,
  SkillsService,
  UploadsService,
  ModelService,
} from "../../client";
import { type SubmitHandler, useForm, Controller } from "react-hook-form";
import { Select as MultiSelect, chakraComponents } from "chakra-react-select";
import { forwardRef, Ref, useState } from "react";
import ModelSelect from "../Teams/ModelProvider";

interface EditTeamMemberProps {
  member: MemberOut;
  teamId: number;
  isOpen: boolean;
  onClose: () => void;
  ref?: Ref<HTMLFormElement>;
}

type MemberTypes =
  | "root"
  | "leader"
  | "worker"
  | "freelancer"
  | "freelancer_root"
  | "chatbot"
  | "ragbot";

interface MemberConfigs {
  selection: MemberTypes[];
  enableSkillTools: boolean;
  enableUploadTools: boolean;
  enableInterrupt: boolean;
  enableHumanTool: boolean;
}

const customSelectOption = {
  Option: (props: any) => (
    <chakraComponents.Option {...props}>
      {props.children}: {props.data.description}
    </chakraComponents.Option>
  ),
};

const ALLOWED_MEMBER_CONFIGS: Record<MemberTypes, MemberConfigs> = {
  root: {
    selection: ["root"],
    enableSkillTools: false,
    enableUploadTools: false,
    enableInterrupt: false,
    enableHumanTool: false,
  },
  leader: {
    selection: ["worker", "leader"],
    enableSkillTools: false,
    enableUploadTools: false,
    enableInterrupt: false,
    enableHumanTool: false,
  },
  worker: {
    selection: ["worker", "leader"],
    enableSkillTools: true,
    enableUploadTools: true,
    enableInterrupt: false,
    enableHumanTool: false,
  },
  freelancer: {
    selection: ["freelancer"],
    enableSkillTools: true,
    enableUploadTools: true,
    enableInterrupt: true,
    enableHumanTool: true,
  },
  freelancer_root: {
    selection: ["freelancer_root"],
    enableSkillTools: true,
    enableUploadTools: true,
    enableInterrupt: true,
    enableHumanTool: true,
  },
  chatbot: {
    selection: ["chatbot"],
    enableSkillTools: true,
    enableUploadTools: true,
    enableInterrupt: true,
    enableHumanTool: true,
  },
  ragbot: {
    selection: ["ragbot"],
    enableSkillTools: false,
    enableUploadTools: true,
    enableInterrupt: false,
    enableHumanTool: false,
  },
};

const EditTeamMember = forwardRef<HTMLFormElement, EditTeamMemberProps>(
  ({ member, teamId, isOpen, onClose }, ref) => {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();
    const [showTooltip, setShowTooltip] = useState(false);
    const {
      data: skills,
      isLoading: isLoadingSkills,
      isError: isErrorSkills,
      error: errorSkills,
    } = useQuery("skills", () => SkillsService.readSkills({}));
    const {
      data: uploads,
      isLoading: isLoadingUploads,
      isError: isErrorUploads,
      error: errorUploads,
    } = useQuery("uploads", () =>
      UploadsService.readUploads({ status: "Completed" })
    );

    const {
      data: models,
      isLoading: isLoadingModel,
      isError: isErrorModel,
      error: errorModel,
    } = useQuery("model", () => ModelService.readModels());

    if (isErrorSkills || isErrorUploads || isErrorModel) {
      const error = errorSkills || errorUploads || errorModel;
      const errDetail = (error as ApiError).body?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    }

    const {
      register,
      handleSubmit,
      reset,
      control,
      watch,
      setValue,
      formState: { isSubmitting, errors, isDirty, isValid },
    } = useForm<MemberUpdate>({
      mode: "onBlur",
      criteriaMode: "all",
      values: {
        ...member,
        skills: member.skills.map((skill) => ({
          ...skill,
          label: skill.name,
          value: skill.id,
        })),
        uploads: member.uploads.map((upload) => ({
          ...upload,
          label: upload.name,
          value: upload.id,
        })),
      },
    });

    const updateMember = async (data: MemberUpdate) => {
      return await MembersService.updateMember({
        id: member.id,
        teamId: teamId,
        requestBody: data,
      });
    };

    const mutation = useMutation(updateMember, {
      onSuccess: (data) => {
        showToast("Success!", "Team updated successfully.", "success");
        reset(data); // reset isDirty after updating
        onClose();
      },
      onError: (err: ApiError) => {
        const errDetail = err.body?.detail;
        showToast("Something went wrong.", `${errDetail}`, "error");
      },
      onSettled: () => {
        queryClient.invalidateQueries(`teams/${teamId}/members`);
      },
    });

    const onSubmit: SubmitHandler<TeamUpdate> = async (data) => {
      mutation.mutate(data);
    };

    const onCancel = () => {
      reset();
      onClose();
    };

    const memberConfig = ALLOWED_MEMBER_CONFIGS[watch("type") as MemberTypes];

    const skillOptions = skills
      ? skills.data
          // Remove 'ask-human' tool if 'enableHumanTool' is false
          .filter(
            (skill) =>
              skill.name !== "ask-human" || memberConfig.enableHumanTool
          )
          .map((skill) => ({
            ...skill,
            label: skill.name,
            value: skill.id,
          }))
      : [];

    const uploadOptions = uploads
      ? uploads.data.map((upload) => ({
          ...upload,
          label: upload.name,
          value: upload.id,
        }))
      : [];

    const onModelSelect = (modelName: string) => {
      const selectedModel = models?.data.find(
        (model) => model.ai_model_name === modelName
      );
      setValue("model", modelName);
      setValue("openai_api_key", selectedModel?.provider.api_key);
      setValue("provider", selectedModel?.provider.provider_name);
      setValue("openai_api_base", selectedModel?.provider.base_url);
    };

    if (member.type.endsWith("bot")) {
      return (
        <Box maxH={"full"} h="full" minH="full" mr="2" overflow={"hidden"}>
          <Box
            as="form"
            ref={ref}
            onSubmit={handleSubmit(onSubmit)}
            bg={"white"}
            borderRadius={"lg"}
            h="full"
            maxH={"full"}
            minH="full"
          >
            <Box
              display="flex"
              flexDirection={"column"}
              h="full"
              overflow={"auto"}
            >
              <FormControl mt={4} isRequired isInvalid={!!errors.name} px="6">
                <FormLabel htmlFor="name">名字</FormLabel>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required.",
                    pattern: {
                      value: /^[a-zA-Z0-9_-]{1,64}$/,
                      message:
                        "Name must follow pattern: ^[a-zA-Z0-9_-]{1,64}$",
                    },
                  })}
                  placeholder="Name"
                  type="text"
                />
                {errors.name && (
                  <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl mt={4} isRequired isInvalid={!!errors.role} px="6">
                <FormLabel htmlFor="role">角色</FormLabel>
                <Textarea
                  id="role"
                  {...register("role", { required: "Role is required." })}
                  placeholder="Role"
                  className="nodrag nopan"
                />
                {errors.role && (
                  <FormErrorMessage>{errors.role.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl mt={4} px="6">
                <FormLabel htmlFor="backstory">背景故事</FormLabel>
                <Textarea
                  id="backstory"
                  {...register("backstory")}
                  className="nodrag nopan"
                />
              </FormControl>
              <Box px={6} mt={4}>
                <ModelSelect
                  models={models}
                  control={control}
                  onModelSelect={onModelSelect}
                  isLoading={isLoadingModel}
                />
              </Box>
              {memberConfig.enableSkillTools && (
                <Controller
                  control={control}
                  name="skills"
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { error },
                  }) => (
                    <FormControl mt={4} px="6" isInvalid={!!error} id="skills">
                      <FormLabel>工具</FormLabel>
                      <MultiSelect
                        isLoading={isLoadingSkills}
                        isMulti
                        name={name}
                        ref={ref}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        options={skillOptions}
                        placeholder="Select skills"
                        closeMenuOnSelect={false}
                        components={customSelectOption}
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />
              )}

              {memberConfig.enableUploadTools && (
                <Controller
                  control={control}
                  name="uploads"
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { error },
                  }) => (
                    <FormControl mt={4} px="6" isInvalid={!!error} id="uploads">
                      <FormLabel>知识库</FormLabel>
                      <MultiSelect
                        // isDisabled={}
                        isLoading={isLoadingUploads}
                        isMulti
                        name={name}
                        ref={ref}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        options={uploadOptions}
                        placeholder="Select uploads"
                        closeMenuOnSelect={false}
                        components={customSelectOption}
                      />
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    </FormControl>
                  )}
                />
              )}
              {memberConfig.enableInterrupt && (
                <FormControl mt={4} px="6">
                  <FormLabel htmlFor="interrupt">Human In The Loop</FormLabel>
                  <Checkbox {...register("interrupt")}>
                    Require approval before executing actions
                  </Checkbox>
                </FormControl>
              )}

              <Controller
                control={control}
                name="temperature"
                rules={{ required: true }}
                render={({
                  field: { onChange, onBlur, value, name, ref },
                  fieldState: { error },
                }) => (
                  <FormControl py={4} px="6" isRequired isInvalid={!!error}>
                    <FormLabel htmlFor="temperature">Temperature</FormLabel>
                    <Slider
                      id="temperature"
                      name={name}
                      value={value ?? 0} // Use nullish coalescing to ensure value is never null
                      onChange={onChange}
                      onBlur={onBlur}
                      ref={ref}
                      min={0}
                      max={1}
                      step={0.1}
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <Tooltip
                        hasArrow
                        placement="top"
                        isOpen={showTooltip}
                        label={watch("temperature")}
                      >
                        <SliderThumb />
                      </Tooltip>
                    </Slider>
                    <FormErrorMessage>{error?.message}</FormErrorMessage>
                  </FormControl>
                )}
              />
            </Box>
          </Box>
        </Box>
      );
    } else {
      return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay>
            <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
              <ModalHeader>Update Team Member</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <FormControl
                  isDisabled={
                    member.type === "root" ||
                    member.type.startsWith("freelancer") ||
                    member.type.endsWith("bot")
                  }
                >
                  <FormLabel htmlFor="type">Type</FormLabel>
                  <Select id="type" {...register("type")}>
                    {memberConfig.selection.map((member, index) => (
                      <option key={index} value={member}>
                        {member}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mt={4} isRequired isInvalid={!!errors.name}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    id="name"
                    {...register("name", {
                      required: "Name is required.",
                      pattern: {
                        value: /^[a-zA-Z0-9_-]{1,64}$/,
                        message:
                          "Name must follow pattern: ^[a-zA-Z0-9_-]{1,64}$",
                      },
                    })}
                    placeholder="Name"
                    type="text"
                  />
                  {errors.name && (
                    <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl mt={4} isRequired isInvalid={!!errors.role}>
                  <FormLabel htmlFor="role">Role</FormLabel>
                  <Textarea
                    id="role"
                    {...register("role", { required: "Role is required." })}
                    placeholder="Role"
                    className="nodrag nopan"
                  />
                  {errors.role && (
                    <FormErrorMessage>{errors.role.message}</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel htmlFor="backstory">Backstory</FormLabel>
                  <Textarea
                    id="backstory"
                    {...register("backstory")}
                    className="nodrag nopan"
                  />
                </FormControl>
                <Box mt={4}>
                  <ModelSelect
                    models={models}
                    control={control}
                    onModelSelect={onModelSelect}
                    isLoading={isLoadingModel}
                  />
                </Box>
                {memberConfig.enableSkillTools && (
                  <Controller
                    control={control}
                    name="skills"
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <FormControl mt={4} isInvalid={!!error} id="skills">
                        <FormLabel>Skills</FormLabel>
                        <MultiSelect
                          isDisabled={!memberConfig.enableSkillTools}
                          isLoading={isLoadingSkills}
                          isMulti
                          name={name}
                          ref={ref}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          options={skillOptions}
                          placeholder="Select skills"
                          closeMenuOnSelect={false}
                          components={customSelectOption}
                        />
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                )}
                {memberConfig.enableUploadTools && (
                  <Controller
                    control={control}
                    name="uploads"
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                      fieldState: { error },
                    }) => (
                      <FormControl mt={4} isInvalid={!!error} id="uploads">
                        <FormLabel>Knowledge Base</FormLabel>
                        <MultiSelect
                          isDisabled={!memberConfig.enableUploadTools}
                          isLoading={isLoadingUploads}
                          isMulti
                          name={name}
                          ref={ref}
                          onChange={onChange}
                          onBlur={onBlur}
                          value={value}
                          options={uploadOptions}
                          placeholder="Select uploads"
                          closeMenuOnSelect={false}
                          components={customSelectOption}
                        />
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      </FormControl>
                    )}
                  />
                )}
                {memberConfig.enableInterrupt && (
                  <FormControl mt={4}>
                    <FormLabel htmlFor="interrupt">Human In The Loop</FormLabel>
                    <Checkbox {...register("interrupt")}>
                      Require approval before executing actions
                    </Checkbox>
                  </FormControl>
                )}

                <Controller
                  control={control}
                  name="temperature"
                  rules={{ required: true }}
                  render={({
                    field: { onChange, onBlur, value, name, ref },
                    fieldState: { error },
                  }) => (
                    <FormControl mt={4} isRequired isInvalid={!!error}>
                      <FormLabel htmlFor="temperature">Temperature</FormLabel>
                      <Slider
                        id="temperature"
                        name={name}
                        value={value ?? 0} // Use nullish coalescing to ensure value is never null
                        onChange={onChange}
                        onBlur={onBlur}
                        ref={ref}
                        min={0}
                        max={1}
                        step={0.1}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <Tooltip
                          hasArrow
                          placement="top"
                          isOpen={showTooltip}
                          label={watch("temperature")}
                        >
                          <SliderThumb />
                        </Tooltip>
                      </Slider>
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
          </ModalOverlay>
        </Modal>
      );
    }
  }
);

EditTeamMember.displayName = "EditTeamMember";
export default EditTeamMember;
