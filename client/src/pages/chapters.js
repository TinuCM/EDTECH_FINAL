import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Button,
  Chip,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import { useRouter } from "next/router";
import axios from "axios";
import UserProfileMenu from "../components/common/UserProfileMenu";

export default function ChaptersPage() {
  const router = useRouter();
  const { subjectId, childId } = router.query; // Get both subjectId and childId from URL
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Color schemes that cycle through for each chapter
  const colorSchemes = [
    { icon: "📚", iconBg: "#E8F4FD", iconColor: "#4A90E2", cardBg: "#E8F4FD" },
    { icon: "➕", iconBg: "#F3E8FD", iconColor: "#9B6DD6", cardBg: "#F3E8FD" },
    { icon: "🔶", iconBg: "#FFF4F0", iconColor: "#FF8C61", cardBg: "#FFF4F0" },
    { icon: "🕐", iconBg: "#FFF9EB", iconColor: "#E8B84D", cardBg: "#FFF9EB" },
    { icon: "🔵", iconBg: "#E8F9F9", iconColor: "#4CB5C5", cardBg: "#E8F9F9" },
    { icon: "💰", iconBg: "#FFF9EB", iconColor: "#D4A944", cardBg: "#FFF9EB" },
  ];

  useEffect(() => {
    if (subjectId && childId) {
      fetchChapters();
    }
  }, [subjectId, childId]);

  const fetchChapters = async () => {
    try {
      setLoading(true);
      
      // Fetch chapters by subjectId and childId from backend
      const response = await axios.get(`/api/v1/chapters/subject/${subjectId}/${childId}`);
      
      if (response.status === 200 && response.data.chapters) {
        // Enhance chapters with colors and icons only
        // Backend already provides: locked, status, progress
        const enhancedChapters = response.data.chapters.map((chapter, index) => {
          const colors = colorSchemes[index % colorSchemes.length];
          
          return {
            ...chapter,
            id: chapter._id,
            ...colors,
            // Use backend-provided status, progress, and locked values
          };
        });
        
        setChapters(enhancedChapters);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setLoading(false);
    }
  };

  const handleChapterClick = (chapter) => {
    if (!chapter.locked) {
      // Navigate to chapter details or lessons
      // Pass chapterId, subjectId, and childId
      router.push(`/chapter/${chapter.id}?subjectId=${subjectId}&childId=${childId}`);
    }
  };

  const markChapterComplete = async (chapterId) => {
    try {
      const response = await axios.post("/api/v1/chapters/complete", {
        chapterId: chapterId,
        subjectId: subjectId,
        childId: childId,
      });

      if (response.status === 200) {
        // Refresh chapters to update UI
        fetchChapters();
      }
    } catch (error) {
      console.error("Error marking chapter as complete:", error);
    }
  };

  const updateChapterProgress = async (chapterId, progressPercentage) => {
    try {
      const response = await axios.post("/api/v1/chapters/progress/update", {
        chapterId: chapterId,
        subjectId: subjectId,
        childId: childId,
        progressPercentage: progressPercentage,
        completed: progressPercentage >= 100,
      });

      if (response.status === 200) {
        // Optionally refresh chapters
        fetchChapters();
      }
    } catch (error) {
      console.error("Error updating chapter progress:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getStatusChip = (status) => {
    if (status === "Completed") {
      return (
        <Chip
          label="✓ Completed"
          size="small"
          sx={{
            backgroundColor: "#E8F5E9",
            color: "#4CAF50",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: "24px",
            border: "none",
          }}
        />
      );
    } else if (status === "In Progress") {
      return (
        <Chip
          label="In Progress"
          size="small"
          sx={{
            backgroundColor: "#E3F2FD",
            color: "#2196F3",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: "24px",
            border: "none",
          }}
        />
      );
    } else if (status === "Not Started") {
      return (
        <Chip
          label="Not Started"
          size="small"
          sx={{
            backgroundColor: "#FFF9C4",
            color: "#F57C00",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: "24px",
            border: "none",
          }}
        />
      );
    } else {
      return (
        <Chip
          label="Locked"
          size="small"
          sx={{
            backgroundColor: "#F5F5F5",
            color: "#9E9E9E",
            fontWeight: 600,
            fontSize: "0.7rem",
            height: "24px",
            border: "none",
          }}
        />
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
        padding: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xl">
        {/* Main White Container */}
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: 4,
            padding: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                onClick={handleBack}
                sx={{
                  backgroundColor: "#f5f5f5",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              
              <Box
                component="img"
                src="/Black logo (1).png"
                alt="Study.Pilot Logo"
                sx={{
                  width: 120,
                  height: "auto",
                }}
              />
            </Box>

            {/* User Profile Menu */}
            <UserProfileMenu />
          </Box>

          {/* Title Section */}
          <Box sx={{ marginBottom: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#000",
                marginBottom: 1,
              }}
            >
              Start Your Adventure!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
              }}
            >
              Choose a chapter to select your mathematical journey.
            </Typography>
          </Box>

          {/* Chapters Grid */}
          <Grid container spacing={1.5} sx={{ width: "100%" }}>
            {chapters.map((chapter) => {
              return (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4}
                  key={chapter.id}
                  sx={{
                    display: "flex",
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: { xs: "100%", sm: "50%", md: "calc(33.333333% - 10px)" },
                    maxWidth: { xs: "100%", sm: "50%", md: "calc(33.333333% - 10px)" },
                  }}
                >
                  <Card
                    onClick={() => handleChapterClick(chapter)}
                    sx={{
                      borderRadius: 2.5,
                      cursor: chapter.locked ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease",
                      opacity: chapter.locked ? 0.8 : 1,
                      backgroundColor: chapter.cardBg,
                      boxShadow: "none",
                      border: "1px solid rgba(0,0,0,0.06)",
                      "&:hover": {
                        transform: chapter.locked ? "none" : "translateY(-4px)",
                        boxShadow: chapter.locked
                          ? "none"
                          : "0 8px 20px rgba(0,0,0,0.08)",
                      },
                      width: "100%",
                      minWidth: 0,
                      maxWidth: "100%",
                      height: "240px",
                      minHeight: "240px",
                      maxHeight: "240px",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    <CardContent 
                      sx={{ 
                        padding: 1.5, 
                        flex: 1, 
                        display: "flex", 
                        flexDirection: "column",
                        overflow: "hidden",
                        height: "100%",
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 1.5,
                        }}
                      >
                        {/* Icon */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2rem",
                          }}
                        >
                          {chapter.icon}
                        </Box>

                        {/* Status Badge */}
                        {getStatusChip(chapter.status)}
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "#000",
                          marginBottom: 0.5,
                          fontSize: "1rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          lineHeight: 1.4,
                          minHeight: "1.4rem",
                        }}
                      >
                        {chapter.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          marginBottom: 1.5,
                          lineHeight: 1.5,
                          fontSize: "0.85rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          minHeight: "3.825rem", // 3 lines * 1.5 line-height * 0.85rem
                          maxHeight: "3.825rem",
                        }}
                      >
                        {chapter.description}
                      </Typography>

                      {/* Progress Bar for non-locked chapters */}
                      {!chapter.locked && chapter.progress > 0 && chapter.progress < 100 && (
                        <Box sx={{ marginTop: 1.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={chapter.progress}
                            sx={{
                              height: 5,
                              borderRadius: 3,
                              backgroundColor: "rgba(0,0,0,0.08)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                backgroundColor: "#FF9800",
                              },
                            }}
                          />
                        </Box>
                      )}

                      {/* Action Button for unlocked chapters */}
                      {!chapter.locked && (
                        <Button
                          fullWidth
                          variant="text"
                          sx={{
                            marginTop: "auto",
                            color: chapter.iconColor,
                            fontWeight: 600,
                            textTransform: "none",
                            justifyContent: "flex-end",
                            fontSize: "0.85rem",
                            padding: "4px 8px",
                            minHeight: "32px",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.5)",
                            },
                          }}
                        >
                          {chapter.status === "Completed"
                            ? "Review Chapter →"
                            : "Continue →"}
                        </Button>
                      )}

                      {/* Locked Message */}
                      {chapter.locked && (
                        <Box
                          sx={{
                            marginTop: "auto",
                            padding: 1,
                            backgroundColor: "rgba(255,255,255,0.6)",
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            minHeight: "32px",
                          }}
                        >
                          <LockIcon sx={{ fontSize: 14, color: "#999", flexShrink: 0 }} />
                          <Typography
                            variant="caption"
                            sx={{ 
                              color: "#666", 
                              fontWeight: 500, 
                              fontSize: "0.75rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Complete previous
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

