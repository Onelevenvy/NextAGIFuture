"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  useColorModeValue,
  Textarea,
  Spinner,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { UploadsService, type ApiError } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";

const SearchTypes = {
  VECTOR: "vector",
  FULLTEXT: "fulltext",
  HYBRID: "hybrid",
};

function KnowledgeTest() {
  const { uploadId } = useParams();
  const showToast = useCustomToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState(SearchTypes.VECTOR);
  const [topK, setTopK] = useState(5);
  const [scoreThreshold, setScoreThreshold] = useState(0.5);
  const [searchTaskId, setSearchTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const {
    data: upload,
    isLoading,
    isError,
    error,
  } = useQuery(
    ["upload", uploadId],
    () => UploadsService.readUploads({ status: "Completed" }),
    {
      onError: (err: ApiError) => {
        const errDetail = err.body?.detail;
        showToast("Error fetching upload", `${errDetail}`, "error");
      },
    }
  );

  const searchMutation = useMutation(
    (searchParams: {
      query: string;
      searchType: string;
      topK: number;
      scoreThreshold: number;
    }) =>
      UploadsService.searchUpload({
        uploadId: Number(uploadId),
        requestBody: {
          query: searchParams.query,
          search_type: searchParams.searchType,
          top_k: searchParams.topK,
          score_threshold: searchParams.scoreThreshold,
        },
      }),
    {
      onSuccess: (data) => {
        setSearchTaskId(data.task_id);
        setIsModalOpen(false); // Close modal on success
      },
      onError: (error: ApiError) => {
        showToast(
          "Search Error",
          error.body?.detail || "An error occurred",
          "error"
        );
      },
    }
  );

  const { data: searchResults, refetch: refetchSearchResults } = useQuery(
    ["searchResults", searchTaskId],
    () =>
      UploadsService.getSearchResults({
        taskId: searchTaskId as string,
      }),
    {
      enabled: !!searchTaskId,
      refetchInterval: (data) => (data?.status === "completed" ? false : 1000),
    }
  );

  useEffect(() => {
    if (searchResults?.status === "completed") {
      queryClient.setQueryData(["searchResults", searchTaskId], searchResults);
    }
  }, [searchResults, searchTaskId, queryClient]);

  const handleSearch = () => {
    searchMutation.mutate({ query, searchType, topK, scoreThreshold });
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (isError) {
    return <Box>Error: {(error as ApiError).body?.detail}</Box>;
  }

  const currentUpload = upload?.data.find((u) => u.id === Number(uploadId));

  return (
    <Box p={6}>
      <Heading mb={6}>Test Knowledge Base: {currentUpload?.name}</Heading>
      <HStack spacing={6} align="flex-start">
        <VStack spacing={4} align="stretch" flex={1}>
          <HStack spacing={4}>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query here"
              size="lg"
              flex={1}
            />
            <Button colorScheme="blue" onClick={handleSearch}>
              Search
            </Button>
            <Button colorScheme="gray" onClick={() => setIsModalOpen(true)}>
              Set Search Options
            </Button>
          </HStack>
          <Box
            bg={bgColor}
            p={6}
            borderRadius="md"
            borderWidth={1}
            borderColor={borderColor}
          >
            <Heading size="md" mb={4}>
              Results
            </Heading>
            <VStack spacing={4} align="stretch">
              {searchResults?.status === "pending" ? (
                <Spinner />
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {searchResults?.results?.map((result:any, index:any) => (
                    <Box key={index} p={4} borderWidth={1} borderRadius="md">
                      <Text>{result.content}</Text>
                      <Text fontWeight="bold" mt={2}>
                        Score: {result.score.toFixed(2)}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </VStack>
          </Box>
        </VStack>

        {/* Modal for Search Options */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Search Options</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text>Search Type:</Text>
                <RadioGroup onChange={setSearchType} value={searchType}>
                  <HStack spacing={4}>
                    <Radio value={SearchTypes.VECTOR}>Vector</Radio>
                    <Radio value={SearchTypes.FULLTEXT}>Fulltext</Radio>
                    <Radio value={SearchTypes.HYBRID}>Hybrid</Radio>
                  </HStack>
                </RadioGroup>
                <Text>Top K:</Text>
                <Slider
                  defaultValue={topK}
                  min={1}
                  max={20}
                  onChange={(val) => setTopK(val)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                  <SliderMark value={topK} mt="2" ml="-2.5" fontSize="sm">
                    {topK}
                  </SliderMark>
                </Slider>
                <Text>Score Threshold:</Text>
                <Slider
                  defaultValue={scoreThreshold}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(val) => setScoreThreshold(val)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                  <SliderMark
                    value={scoreThreshold}
                    mt="2"
                    ml="-2.5"
                    fontSize="sm"
                  >
                    {scoreThreshold.toFixed(1)}
                  </SliderMark>
                </Slider>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </HStack>
    </Box>
  );
}

export default KnowledgeTest;
