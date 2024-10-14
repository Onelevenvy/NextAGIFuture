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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
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
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);

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
    if (!query.trim()) {
      showToast("Error", "Please enter a query before searching", "error");
      return;
    }
    searchMutation.mutate({ query, searchType, topK, scoreThreshold });
    setIsOptionsVisible(false);
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
        <Box position="relative" flex={1}>
          <Button
            position="absolute"
            top={2}
            right={2}
            size="sm"
            colorScheme="blue"
            onClick={() => setIsOptionsVisible(!isOptionsVisible)}
            zIndex={2}
          >
            {searchType}
          </Button>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query here"
            size="lg"
            pr={24}
            pt={12}
            pb={16}
            h="500px"
          />
          <Button
            position="absolute"
            bottom={2}
            right={2}
            colorScheme="blue"
            onClick={handleSearch}
            zIndex={2}
          >
            Search
          </Button>
        </Box>

        <Box
          bg={bgColor}
          p={6}
          borderRadius="md"
          borderWidth={1}
          borderColor={borderColor}
          flex={1}
          minH="300px"
        >
          {searchResults?.status === "pending" && <Spinner />}
          {searchResults?.results && (
            <>
              <Heading size="md" mb={4}>
                Results
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 1 }} spacing={4}>
                {searchResults.results.map((result: any, index: number) => (
                  <Box key={index} p={4} borderWidth={1} borderRadius="md">
                    <Text>{result.content}</Text>
                    <Text fontWeight="bold" mt={2}>
                      Score: {result.score.toFixed(2)}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </>
          )}
        </Box>

        {/* 搜索选项 */}
        {isOptionsVisible && (
          <Box
            position="absolute"
            right="0"
            top="0"
            bg={bgColor}
            p={4}
            borderRadius="md"
            borderWidth={1}
            borderColor={borderColor}
            boxShadow="md"
          >
            <VStack spacing={4} align="stretch">
              <HStack justifyContent="space-between">
                <Text fontWeight="bold">Search Options</Text>
                <Button size="sm" onClick={() => setIsOptionsVisible(false)}>
                  X
                </Button>
              </HStack>
              <Text>Search Type:</Text>
              <RadioGroup onChange={setSearchType} value={searchType}>
                <VStack align="start">
                  <Radio value={SearchTypes.VECTOR}>Vector</Radio>
                  <Radio value={SearchTypes.FULLTEXT}>Fulltext</Radio>
                  <Radio value={SearchTypes.HYBRID}>Hybrid</Radio>
                </VStack>
              </RadioGroup>
              <Text>Top K: {topK}</Text>
              <Slider
                value={topK}
                min={1}
                max={20}
                onChange={(val) => setTopK(val)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <Text>Score Threshold: {scoreThreshold.toFixed(1)}</Text>
              <Slider
                value={scoreThreshold}
                min={0}
                max={1}
                step={0.1}
                onChange={(val) => setScoreThreshold(val)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </VStack>
          </Box>
        )}
      </HStack>
    </Box>
  );
}

export default KnowledgeTest;
