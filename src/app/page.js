"use client";

import { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  CircularProgress, 
  Card, 
  CardContent,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
  useMediaQuery,
  useTheme,
  Link
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [task, setTask] = useState('Go to amazon.com, search for laptop, sort by best rating, and give me the price of the first result');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
  const [showAllSteps, setShowAllSteps] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [currentStepView, setCurrentStepView] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  
  // Handle sort order menu
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleSortOrderChange = (newOrder) => {
    setSortOrder(newOrder);
    setNotification({
      open: true,
      message: `Showing ${newOrder === 'newest' ? 'newest' : 'oldest'} steps first`,
      severity: 'info'
    });
    handleMenuClose();
  };
  
  const toggleShowAllSteps = () => {
    setShowAllSteps(!showAllSteps);
    setNotification({
      open: true,
      message: !showAllSteps ? 'Showing all steps' : 'First step hidden',
      severity: 'info'
    });
    handleMenuClose();
  };
  
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };
  
  const toggleExpandCard = (index) => {
    setExpandedCards({
      ...expandedCards,
      [index]: !expandedCards[index]
    });
  };
  
  const handleSearch = async () => {
    if (!task.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a task first',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data.result);
      setNotification({
        open: true,
        message: 'Search completed successfully',
        severity: 'success'
      });
      
      // Expand the first card by default
      if (data.result?.history?.length > 0) {
        const firstCardIndex = sortOrder === 'newest' ? 0 : data.result.history.length - 1;
        setExpandedCards({ [firstCardIndex]: true });
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Make URL clickable function
  const renderClickableUrl = (url) => {
    if (!url) return 'N/A';
    
    try {
      // Validate URL before making it clickable
      new URL(url);
      return (
        <Link 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            wordBreak: 'break-all'
          }}
        >
          {url}
          <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16 }} />
        </Link>
      );
    } catch(e) {
      // If not a valid URL, just return as text
      return url;
    }
  };
  
  // Mock function to download results
  const handleDownloadResults = () => {
    if (!result) {
      setNotification({
        open: true,
        message: 'No results to download',
        severity: 'warning'
      });
      return;
    }
    
    try {
      const dataStr = JSON.stringify(result, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', 'search-results.json');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setNotification({
        open: true,
        message: 'Results downloaded successfully',
        severity: 'success'
      });
    } catch (err) {
      setNotification({
        open: true,
        message: 'Failed to download results',
        severity: 'error'
      });
    }
    
    handleMenuClose();
  };
  
  // Process history data based on current settings
  const processedHistory = result?.history ? 
    (showAllSteps ? [...result.history] : [...result.history.slice(1)]) : 
    [];
    
  // Sort based on sort order
  const sortedHistory = sortOrder === 'newest' ? 
    [...processedHistory].reverse() : 
    [...processedHistory];
  
  // Get the last step's result (final result)
  const finalResult = result?.history?.length > 0 ? 
    result.history[result.history.length - 1].result : 
    [];
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      minHeight: '100vh',
      bgcolor: '#f9fafb'
    }}>
      {/* Left Side - Chat Window */}
      <Box 
        sx={{ 
          width: isMobile ? '100%' : '350px', 
          borderRight: isMobile ? 'none' : '1px solid #e0e0e0',
          borderBottom: isMobile ? '1px solid #e0e0e0' : 'none',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'auto' : '100vh',
          position: isMobile ? 'relative' : 'sticky',
          top: 0,
          bgcolor: '#ffffff',
          boxShadow: '0 0 10px rgba(0,0,0,0.05)',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SearchIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography variant="h5" component="h1" fontWeight="600">
            Web Assistant
          </Typography>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            bgcolor: '#f9fafb'
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            What would you like to search for?
          </Typography>
          
          <TextField
            fullWidth
            placeholder="Enter your task here..."
            variant="outlined"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            multiline
            rows={4}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              }
            }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleSearch}
            disabled={loading}
            fullWidth
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            sx={{ 
              borderRadius: 1.5,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </Paper>
        
        {result && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="600">Options</Typography>
              
              <IconButton
                size="small"
                aria-label="more options"
                aria-controls="menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
              >
                <MoreVertIcon />
              </IconButton>
              
              <Menu
                id="menu"
                anchorEl={menuAnchorEl}
                keepMounted
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleSortOrderChange('newest')}>
                  {sortOrder === 'newest' && '✓ '}Show newest first
                </MenuItem>
                <MenuItem onClick={() => handleSortOrderChange('oldest')}>
                  {sortOrder === 'oldest' && '✓ '}Show oldest first
                </MenuItem>
                <Divider />
                <MenuItem onClick={toggleShowAllSteps}>
                  {showAllSteps ? '✓ Show all steps' : 'Show all steps'}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleDownloadResults}>
                  <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
                  Download results
                </MenuItem>
              </Menu>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                icon={<SwapVertIcon />} 
                label={sortOrder === 'newest' ? 'Newest first' : 'Oldest first'} 
                variant="outlined" 
                onClick={() => handleSortOrderChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
                size="small"
              />
              <Chip 
                icon={<FilterListIcon />} 
                label={showAllSteps ? 'All steps' : 'Skip first'} 
                variant="outlined" 
                onClick={toggleShowAllSteps}
                size="small"
              />
            </Box>
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Make sure your local server is running at http://localhost:8000
            </Typography>
          </Alert>
        )}
        
        {isMobile && result && (
          <Button 
            variant="outlined"
            fullWidth
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            sx={{ mb: 2, textTransform: 'none' }}
          >
            Scroll to results
          </Button>
        )}
      </Box>
      
      {/* Right Side - Results */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        overflowY: 'auto',
        bgcolor: '#f9fafb',
        minHeight: isMobile ? '100vh' : 'auto'
      }}>
        {result ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              borderBottom: '1px solid #e0e0e0',
              pb: 2
            }}>
              <Typography variant="h5" fontWeight="600">
                Search Results
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Number of steps">
                  <Chip 
                    label={`${sortedHistory.length} step${sortedHistory.length !== 1 ? 's' : ''}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                </Tooltip>
              </Box>
            </Box>
            
            {/* Final Result Section */}
            {finalResult && finalResult.length > 0 && (
              <Card 
                sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  bgcolor: theme.palette.primary.light + '10',
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <InfoOutlinedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="600">
                      Final Result
                    </Typography>
                  </Box>
                  
                  <Paper elevation={0} sx={{ p: 3, bgcolor: '#fff', borderRadius: 1 }}>
                    {finalResult.map((item, idx) => (
                      <Box key={idx} sx={{ mb: idx < finalResult.length - 1 ? 2 : 0 }}>
                        <Typography variant="body1">
                          {item.extracted_content}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </CardContent>
              </Card>
            )}
            
            {sortedHistory.length > 0 ? (
              <>
                <Box sx={{ mb: 4, display: isMobile ? 'none' : 'block' }}>
                  <Stepper alternativeLabel>
                    {sortedHistory.map((step, index) => {
                      const stepNumber = sortOrder === 'newest' 
                        ? processedHistory.length - index 
                        : index + (showAllSteps ? 1 : 2);
                      
                      return (
                        <Step key={index} completed={true}>
                          <StepLabel>
                            Step {stepNumber}
                          </StepLabel>
                        </Step>
                      );
                    })}
                  </Stepper>
                </Box>
                
                {sortedHistory.map((historyItem, index) => {
                  // Calculate the original step number
                  const stepNumber = sortOrder === 'newest' 
                    ? processedHistory.length - index 
                    : index + (showAllSteps ? 1 : 2);
                  
                  const isExpanded = expandedCards[index] || false;
                  
                  return (
                    <Card 
                      key={index} 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        boxShadow: isExpanded ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.3s ease',
                        overflow: 'visible'
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
                            bgcolor: isExpanded ? theme.palette.primary.light + '10' : 'transparent',
                            borderTopLeftRadius: 2,
                            borderTopRightRadius: 2,
                          }}
                          onClick={() => toggleExpandCard(index)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={`Step ${stepNumber}`}
                              size="small"
                              color={index === 0 ? "primary" : "default"}
                              sx={{ mr: 1.5 }}
                            />
                            
                            <Typography variant="subtitle1" fontWeight="500">
                              {historyItem.model_output?.current_state?.next_goal || `Action ${stepNumber}`}
                            </Typography>
                          </Box>
                          
                          <IconButton 
                            size="small"
                            sx={{ 
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s ease'
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Box>
                        
                        {isExpanded && (
                          <Box sx={{ p: 2 }}>
                            <Tabs 
                              value={selectedTab} 
                              onChange={(e, newValue) => setSelectedTab(newValue)}
                              sx={{ mb: 2, borderBottom: '1px solid #e0e0e0' }}
                            >
                              <Tab label="Visual" />
                              <Tab label="Details" />
                              <Tab label="Results" />
                            </Tabs>
                            
                            {/* Visual Tab */}
                            {selectedTab === 0 && (
                              <Box>
                                {historyItem.state?.screenshot ? (
                                  <Box sx={{ 
                                    border: '1px solid #e0e0e0', 
                                    borderRadius: 1, 
                                    overflow: 'hidden',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }}>
                                    <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center' }}>
                                      <Typography variant="caption" fontWeight="500">
                                        {historyItem.state?.title || 'Screenshot'}
                                      </Typography>
                                    </Box>
                                    <img 
                                      src={`data:image/png;base64,${historyItem.state.screenshot}`} 
                                      alt={`Step ${stepNumber} screenshot`}
                                      style={{ width: '100%', height: 'auto', display: 'block' }}
                                    />
                                  </Box>
                                ) : (
                                  <Alert severity="info">
                                    No screenshot available or truncated in the example
                                  </Alert>
                                )}
                                
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom fontWeight="600">Page Info:</Typography>
                                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">URL:</Typography>
                                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                          {historyItem.state?.url ? renderClickableUrl(historyItem.state.url) : 'N/A'}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <Typography variant="body2" color="text.secondary">Title:</Typography>
                                        <Typography variant="body2">
                                          {historyItem.state?.title || 'N/A'}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Paper>
                                </Box>
                              </Box>
                            )}
                            
                            {/* Details Tab */}
                            {selectedTab === 1 && (
                              <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="600">Current State:</Typography>
                                {historyItem.model_output?.current_state ? (
                                  <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Previous Goal:</Typography>
                                        <Typography variant="body2">
                                          {historyItem.model_output.current_state.evaluation_previous_goal}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Memory:</Typography>
                                        <Typography variant="body2">
                                          {historyItem.model_output.current_state.memory}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Typography variant="body2" color="text.secondary">Next Goal:</Typography>
                                        <Typography variant="body2">
                                          {historyItem.model_output.current_state.next_goal}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Paper>
                                ) : (
                                  <Alert severity="info" sx={{ mb: 3 }}>No state information available</Alert>
                                )}
                                
                                <Typography variant="subtitle2" gutterBottom fontWeight="600">Actions:</Typography>
                                {historyItem.model_output?.action?.length > 0 ? (
                                  <Paper elevation={0} sx={{ p: 0, mb: 3, bgcolor: 'transparent', borderRadius: 1 }}>
                                    {historyItem.model_output.action.map((action, actionIndex) => (
                                      <Box 
                                        key={actionIndex}
                                        sx={{ 
                                          p: 2, 
                                          mb: 1, 
                                          bgcolor: '#f5f5f5', 
                                          borderRadius: 1,
                                          border: '1px solid #e0e0e0',
                                        }}
                                      >
                                        <Typography variant="body2" fontWeight="500" gutterBottom>
                                          Action {actionIndex + 1}:
                                        </Typography>
                                        
                                        {action.go_to_url && (
                                          <Typography variant="body2">
                                            Go to URL: <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: '#e3f2fd', px: 0.5, borderRadius: 0.5 }}>
                                              {renderClickableUrl(action.go_to_url.url)}
                                            </Box>
                                          </Typography>
                                        )}
                                        
                                        {action.input_text && (
                                          <Typography variant="body2">
                                            Input Text: <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: '#e3f2fd', px: 0.5, borderRadius: 0.5 }}>"{action.input_text.text}"</Box> at index {action.input_text.index}
                                          </Typography>
                                        )}
                                        
                                        {action.click_element && (
                                          <Typography variant="body2">
                                            Click element at index {action.click_element.index}
                                          </Typography>
                                        )}
                                      </Box>
                                    ))}
                                  </Paper>
                                ) : (
                                  <Alert severity="info" sx={{ mb: 3 }}>No actions performed</Alert>
                                )}
                              </Box>
                            )}
                            
                            {/* Results Tab */}
                            {selectedTab === 2 && (
                              <Box>
                                <Typography variant="subtitle2" gutterBottom fontWeight="600">Results:</Typography>
                                {historyItem.result?.length > 0 ? (
                                  <Paper elevation={0} sx={{ p: 0, bgcolor: 'transparent', borderRadius: 1 }}>
                                    {historyItem.result.map((result, resultIndex) => (
                                      <Box 
                                        key={resultIndex}
                                        sx={{ 
                                          p: 2, 
                                          mb: 1, 
                                          bgcolor: '#f5f5f5', 
                                          borderRadius: 1,
                                          border: '1px solid #e0e0e0',
                                        }}
                                      >
                                        <Typography variant="body2">
                                          {result.extracted_content}
                                        </Typography>
                                        <Chip 
                                          label={result.include_in_memory ? 'Included in memory' : 'Not in memory'} 
                                          size="small" 
                                          color={result.include_in_memory ? 'success' : 'default'}
                                          sx={{ mt: 1 }}
                                        />
                                      </Box>
                                    ))}
                                  </Paper>
                                ) : (
                                  <Alert severity="info">No results available</Alert>
                                )}
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            ) : (
              <Alert severity="warning" sx={{ mb: 3 }}>
                No steps available to display
              </Alert>
            )}
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: isMobile ? 'auto' : '80vh',
            mt: isMobile ? 4 : 0
          }}>
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              maxWidth: 500, 
              bgcolor: '#fff',
              borderRadius: 4,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}>
              <HistoryIcon sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Results Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter a task in the sidebar and click Search to view results here.
              </Typography>
              {isMobile && (
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2, textTransform: 'none' }}
                  onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                >
                  Go to search
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}