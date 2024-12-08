import { Box, Text, Progress, VStack, Heading } from "native-base";
import { useEffect, useState } from "react";
import { getUserProgress, addProgressListener } from "../userProgress";

export default function Profile() {
  const [progress, setProgress] = useState(getUserProgress());
  const [progressValue, setProgressValue] = useState(40);
  const [totalXP, setTotalXP] = useState(40);

  useEffect(() => {
    const currentProgress = getUserProgress();
    setProgress(currentProgress);
    setProgressValue(currentProgress.xp);
    setTotalXP(currentProgress.xp + (currentProgress.level - 1) * 500);

    const unsubscribe = addProgressListener((newProgress) => {
      setProgress(newProgress);
      setProgressValue(newProgress.xp);
      setTotalXP(newProgress.xp + (newProgress.level - 1) * 500);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box flex={1} bg="white" safeArea p={5}>
      <VStack space={6}>
        <Heading size="xl" color="darkBlue.900">
          Welcome, Andrei!
        </Heading>
        
        <Box>
          <Text fontSize="md" color="gray.600" mb={2}>
            Level {progress.level}
          </Text>
          <Progress 
            value={progress.xp}
            size="lg"
            colorScheme="blue"
            bg="coolGray.100"
            max={500}
          />
        </Box>

        <Text fontSize="sm" color="gray.500">
          Total XP: {totalXP}
        </Text>
      </VStack>
    </Box>
  );
}
