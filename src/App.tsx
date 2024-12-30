import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './App.css';

interface SolutionStep {
  board: boolean[][];
  move: { r: number; c: number } | null;
}

interface FloatingWord {
  id: number;
  text: string;
  currentText: string;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  opacity: number;
  spinning: boolean;
  spinProgress: number;
}

function App() {
  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [board, setBoard] = useState<boolean[][]>([]);
  const [solution, setSolution] = useState<boolean[][] | null>(null);
  const [solutionSteps, setSolutionSteps] = useState<SolutionStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [mode, setMode] = useState<'off' | 'on'>('off');
  const [error, setError] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([]);

  useEffect(() => {
    initializeBoard();
  }, [rows, cols]);

  useEffect(() => {
    const words = [
      'algorithm', 'matrix', 'gaussian', 'elimination', 'puzzle', 'solution',
      'boolean', 'vector', 'coefficients', 'linear', 'equation', 'system',
      'binary', 'toggle', 'neighbors', 'optimal', 'recursion', 'iterate',
      'modulo', 'arithmetic', 'transform', 'calculate', 'solve', 'compute',
      'dimension', 'grid', 'topology', 'permutation', 'constraint', 'variable',
      'quantum', 'neural', 'parallel', 'recursive', 'dynamic', 'heuristic',
      'cipher', 'encrypt', 'decode', 'binary', 'hexadecimal', 'polynomial',
      'derivative', 'integral', 'fractal', 'fibonacci', 'sequence', 'pattern'
    ];
    
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    
    const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];
    
    const createRandomText = (length: number) => 
      Array.from({ length }, () => getRandomChar()).join('');
    
    const createWord = (id: number): FloatingWord => {
      const targetText = words[Math.floor(Math.random() * words.length)];
      return {
        id,
        text: targetText,
        currentText: createRandomText(targetText.length),
        x: Math.random() * 100,
        y: Math.random() * 120 - 20,
        speed: 0.08 + Math.random() * 0.12,
        rotation: Math.random() * 20 - 10,
        opacity: 0.12 + Math.random() * 0.18,
        spinning: true,
        spinProgress: 0
      };
    };

    const initialWords = Array.from({ length: 100 }, (_, i) => createWord(i));
    setFloatingWords(initialWords);

    const fallInterval = setInterval(() => {
      setFloatingWords(prev => 
        prev.map(word => {
          if (word.y > 110) {
            const newTarget = words[Math.floor(Math.random() * words.length)];
            return {
              ...word,
              text: newTarget,
              currentText: createRandomText(newTarget.length),
              y: -10,
              x: Math.random() * 100,
              spinning: true,
              spinProgress: 0,
              speed: 0.08 + Math.random() * 0.12, 
              rotation: Math.random() * 20 - 10,
              opacity: 0.12 + Math.random() * 0.18
            };
          }
          return {
            ...word,
            y: word.y + word.speed
          };
        })
      );
    }, 50);

    const spinInterval = setInterval(() => {
      setFloatingWords(prev =>
        prev.map(word => {
          if (!word.spinning) return word;
          

          const newProgress = word.spinProgress + 0.005;
          
          if (newProgress >= 1) {
            return {
              ...word,
              currentText: word.text,
              spinning: false,
              spinProgress: 1
            };
          }

          const newText = word.text.split('').map((targetChar, i) => {

            const charProgress = Math.max(0, (newProgress - (i * 0.08)) * 1.2);
            if (charProgress >= 1) return targetChar;

            return getRandomChar();
          }).join('');
          
          return {
            ...word,
            currentText: newText,
            spinProgress: newProgress
          };
        })
      );
    }, 50);

    return () => {
      clearInterval(fallInterval);
      clearInterval(spinInterval);
    };
  }, []);

  const initializeBoard = () => {
    const newBoard = Array(rows).fill(null).map(() => Array(cols).fill(false));
    setBoard(newBoard);
    setSolution(null);
    setSolutionSteps([]);
    setCurrentStep(0);
    setError('');
  };

  const toggleLight = (row: number, col: number) => {
    if (isAnimating) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = !newBoard[row][col];

    if (row > 0) newBoard[row - 1][col] = !newBoard[row - 1][col];
    if (row < rows - 1) newBoard[row + 1][col] = !newBoard[row + 1][col];
    if (col > 0) newBoard[row][col - 1] = !newBoard[row][col - 1];
    if (col < cols - 1) newBoard[row][col + 1] = !newBoard[row][col + 1];
    
    setBoard(newBoard);
    setSolution(null);
    setSolutionSteps([]);
    setError('');
  };

  const setLightDirectly = (row: number, col: number) => {
    if (isAnimating) return;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = !newBoard[row][col];
    setBoard(newBoard);
    setSolution(null);
    setSolutionSteps([]);
    setError('');
  };

  const gaussianElimination = (matrix: number[][]): number[][] => {
    const m = matrix.length;
    const n = matrix[0].length;
    const augmented = matrix.map(row => [...row]);
    
    let pivot = 0;
    
    for (let col = 0; col < n - 1 && pivot < m; col++) {

      let pivotRow = -1;
      for (let row = pivot; row < m; row++) {
        if (augmented[row][col] === 1) {
          pivotRow = row;
          break;
        }
      }
      
      if (pivotRow === -1) continue;
      
      // Swap rows
      if (pivotRow !== pivot) {
        [augmented[pivot], augmented[pivotRow]] = [augmented[pivotRow], augmented[pivot]];
      }
      
      // Eliminate
      for (let row = 0; row < m; row++) {
        if (row !== pivot && augmented[row][col] === 1) {
          for (let c = 0; c < n; c++) {
            augmented[row][c] = (augmented[row][c] + augmented[pivot][c]) % 2;
          }
        }
      }
      
      pivot++;
    }
    
    return augmented;
  };

  const solveLightsOut = () => {
    setError('');
    setSolution(null);
    setSolutionSteps([]);
    
    const size = rows * cols;
    const targetValue = mode === 'off' ? 0 : 1;

    const matrix: number[][] = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const row = Array(size + 1).fill(0);
        const idx = r * cols + c;

        row[idx] = 1;
        if (r > 0) row[(r - 1) * cols + c] = 1; 
        if (r < rows - 1) row[(r + 1) * cols + c] = 1; 
        if (c > 0) row[r * cols + (c - 1)] = 1;
        if (c < cols - 1) row[r * cols + (c + 1)] = 1; 

        row[size] = (board[r][c] ? 1 : 0) ^ targetValue;
        
        matrix.push(row);
      }
    }

    const solved = gaussianElimination(matrix);

    const solutionVector = Array(size).fill(0);
    
    for (let i = 0; i < size; i++) {
      let pivotCol = -1;
      for (let j = 0; j < size; j++) {
        if (solved[i][j] === 1) {
          pivotCol = j;
          break;
        }
      }
      
      if (pivotCol !== -1) {
        solutionVector[pivotCol] = solved[i][size];
      } else if (solved[i][size] === 1) {
        setError('Решение не существует для данной конфигурации');
        return;
      }
    }
    
    const solutionGrid = Array(rows).fill(null).map(() => Array(cols).fill(false));
    let hasMove = false;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (solutionVector[idx] === 1) {
          solutionGrid[r][c] = true;
          hasMove = true;
        }
      }
    }
    
    if (!hasMove) {
      const allMatch = board.every((row) => 
        row.every((cell) => (cell ? 1 : 0) === targetValue)
      );
      
      if (allMatch) {
        setError(`Все лампочки уже ${mode === 'off' ? 'выключены' : 'включены'}!`);
      } else {
        setError('Решение не найдено');
      }
      return;
    }
    
    setSolution(solutionGrid);
    generateSolutionSteps(solutionGrid);
  };

  const generateSolutionSteps = (solutionGrid: boolean[][]) => {
    const steps: SolutionStep[] = [];
    let currentBoard = board.map(r => [...r]);
    steps.push({ board: currentBoard.map(r => [...r]), move: null });
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (solutionGrid[r][c]) {
          const newBoard = currentBoard.map(row => [...row]);
          
          newBoard[r][c] = !newBoard[r][c];
          if (r > 0) newBoard[r - 1][c] = !newBoard[r - 1][c];
          if (r < rows - 1) newBoard[r + 1][c] = !newBoard[r + 1][c];
          if (c > 0) newBoard[r][c - 1] = !newBoard[r][c - 1];
          if (c < cols - 1) newBoard[r][c + 1] = !newBoard[r][c + 1];
          
          steps.push({ board: newBoard.map(row => [...row]), move: { r, c } });
          currentBoard = newBoard;
        }
      }
    }
    
    setSolutionSteps(steps);
  };

  const animateSolution = () => {
    if (solutionSteps.length === 0) return;
    
    setIsAnimating(true);
    setCurrentStep(0);
    
    const animate = (step: number) => {
      if (step >= solutionSteps.length) {
        setIsAnimating(false);
        return;
      }
      
      setCurrentStep(step);
      setBoard(solutionSteps[step].board);
      
      setTimeout(() => animate(step + 1), 800);
    };
    
    animate(0);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
  };

  const randomBoard = () => {
    if (isAnimating) return;
    
    const newBoard = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => Math.random() > 0.5)
    );
    setBoard(newBoard);
    setSolution(null);
    setSolutionSteps([]);
    setError('');
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRows(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)));
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCols(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)));
  };

  const handleModeChange = (e: SelectChangeEvent<'off' | 'on'>) => {
    setMode(e.target.value as 'off' | 'on');
    setSolution(null);
    setSolutionSteps([]);
    setError('');
  };

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      {/* Floating words background */}
      <div className="floating-words-container">
        {floatingWords.map(word => (
          <div
            key={word.id}
            className={`floating-word ${word.spinning ? 'spinning' : ''}`}
            style={{
              left: `${word.x}%`,
              top: `${word.y}%`,
              transform: `rotate(${word.rotation}deg)`,
              opacity: word.opacity
            }}
          >
            {word.currentText}
          </div>
        ))}
      </div>

      <Container maxWidth="lg" className="py-4">
        {/* Theme toggle button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        <Paper 
          elevation={6} 
          className="p-4 mb-4" 
          sx={{ 
            background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            align="center" 
            className="mb-4"
            sx={{ 
              color: darkMode ? '#fff' : '#000',
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            <LightbulbIcon sx={{ 
              fontSize: { xs: 30, sm: 35, md: 40 }, 
              verticalAlign: 'middle', 
              mr: { xs: 1, sm: 2 }, 
              color: '#ffc107' 
            }} />
            Lights Out Solver
          </Typography>
        
        <Typography 
          variant="body1" 
          align="center" 
          className="mb-4"
          sx={{ 
            color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 1, sm: 2 }
          }}
        >
          Классическая головоломка с алгоритмом решения. Нажмите на лампочку, чтобы изменить её состояние и состояние соседних лампочек.
        </Typography>

        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <TextField
              fullWidth
              type="number"
              label="Количество строк"
              value={rows}
              onChange={handleRowsChange}
              inputProps={{ min: 2, max: 10 }}
              disabled={isAnimating}
              sx={{
                '& .MuiInputLabel-root': { color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' },
                '& .MuiInputBase-input': { color: darkMode ? '#fff' : '#000' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)' }
              }}
            />
          </div>
          
          <div className="col-12 col-md-3">
            <TextField
              fullWidth
              type="number"
              label="Количество столбцов"
              value={cols}
              onChange={handleColsChange}
              inputProps={{ min: 2, max: 10 }}
              disabled={isAnimating}
              sx={{
                '& .MuiInputLabel-root': { color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' },
                '& .MuiInputBase-input': { color: darkMode ? '#fff' : '#000' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)' }
              }}
            />
          </div>

          <div className="col-12 col-md-3">
            <FormControl fullWidth disabled={isAnimating}>
              <InputLabel sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>Цель</InputLabel>
              <Select
                value={mode}
                label="Цель"
                onChange={handleModeChange}
                sx={{
                  color: darkMode ? '#fff' : '#000',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)' },
                  '& .MuiSvgIcon-root': { color: darkMode ? '#fff' : '#000' }
                }}
              >
                <MenuItem value="off">Выключить все</MenuItem>
                <MenuItem value="on">Включить все</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className="col-12 col-md-3">
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={initializeBoard}
              disabled={isAnimating}
              sx={{ 
                height: '56px',
                color: darkMode ? '#fff' : '#000',
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.23)'
              }}
            >
              Очистить
            </Button>
          </div>
        </div>

        <Box className="d-flex justify-content-center gap-2 mb-4" sx={{ 
          flexWrap: 'wrap',
          '& > button': {
            minWidth: { xs: 'auto', sm: '140px' },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            padding: { xs: '6px 12px', sm: '8px 16px' }
          }
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoFixHighIcon sx={{ display: { xs: 'none', sm: 'inline-block' } }} />}
            onClick={solveLightsOut}
            disabled={isAnimating}
          >
            Найти решение
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayArrowIcon sx={{ display: { xs: 'none', sm: 'inline-block' } }} />}
            onClick={animateSolution}
            disabled={!solution || isAnimating || solutionSteps.length === 0}
          >
            Показать
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<StopIcon sx={{ display: { xs: 'none', sm: 'inline-block' } }} />}
            onClick={stopAnimation}
            disabled={!isAnimating}
          >
            Стоп
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ display: { xs: 'none', sm: 'inline-block' } }} />}
            onClick={randomBoard}
            disabled={isAnimating}
          >
            Случайно
          </Button>
        </Box>

        {error && (
          <Alert severity="warning" className="mb-4">
            {error}
          </Alert>
        )}

        {solution && !error && (
          <Alert severity="success" className="mb-4">
            Решение найдено! Нажмите кнопку "Показать решение" для анимации или нажимайте на подсвеченные лампочки.
            {solutionSteps.length > 0 && (
              <Typography variant="body2" className="mt-2">
                Количество ходов: {solutionSteps.length - 1}
              </Typography>
            )}
          </Alert>
        )}

        {isAnimating && solutionSteps[currentStep]?.move && (
          <Alert severity="info" className="mb-4">
            Шаг {currentStep} из {solutionSteps.length - 1}: Нажата лампочка ({solutionSteps[currentStep].move.r + 1}, {solutionSteps[currentStep].move.c + 1})
          </Alert>
        )}

        <Card className="mb-4" sx={{ background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
          <CardContent>
            <Box className="d-flex justify-content-center mb-3" sx={{ width: '100%', overflowX: 'auto' }}>
              <Box className="lights-grid" sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: { xs: '4px', sm: '6px', md: '8px' },
                maxWidth: '600px',
                width: '100%',
                justifyContent: 'center'
              }}>
                {board.map((row, rowIdx) =>
                  row.map((isOn, colIdx) => {
                    const cellSize = Math.min(60, 500 / Math.max(rows, cols));
                    const mobileCellSize = Math.min(50, (window.innerWidth - 60) / cols);
                    
                    return (
                    <Box
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => toggleLight(rowIdx, colIdx)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setLightDirectly(rowIdx, colIdx);
                      }}
                      onTouchStart={(e) => {
                        const timer = setTimeout(() => {
                          setLightDirectly(rowIdx, colIdx);
                        }, 500);
                        (e.currentTarget as any).longPressTimer = timer;
                      }}
                      onTouchEnd={(e) => {
                        const timer = (e.currentTarget as any).longPressTimer;
                        if (timer) clearTimeout(timer);
                      }}
                      className={`light-cell ${isOn ? 'light-on' : 'light-off'} ${
                        solution && solution[rowIdx][colIdx] ? 'solution-highlight' : ''
                      }`}
                      sx={{
                        width: { 
                          xs: `${mobileCellSize}px`, 
                          sm: `${cellSize}px` 
                        },
                        height: { 
                          xs: `${mobileCellSize}px`, 
                          sm: `${cellSize}px` 
                        },
                        minWidth: '30px',
                        minHeight: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                        borderRadius: { xs: '6px', sm: '8px' },
                        transition: 'all 0.3s ease',
                        border: { xs: '2px solid', sm: '3px solid' },
                        borderColor: solution && solution[rowIdx][colIdx] ? '#ff5722' : '#ccc',
                        backgroundColor: isOn ? '#ffc107' : '#424242',
                        boxShadow: isOn 
                          ? '0 0 20px rgba(255, 193, 7, 0.8)' 
                          : '0 2px 4px rgba(0,0,0,0.2)',
                        '&:active': {
                          transform: 'scale(0.95)',
                        },
                        '&:hover': isAnimating ? {} : {
                          transform: 'scale(1.05)',
                          boxShadow: isOn 
                            ? '0 0 30px rgba(255, 193, 7, 1)' 
                            : '0 4px 8px rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      {isOn ? (
                        <LightbulbIcon sx={{ 
                          fontSize: { 
                            xs: Math.min(30, 300 / Math.max(rows, cols)), 
                            sm: Math.min(40, 400 / Math.max(rows, cols)) 
                          }, 
                          color: '#fff' 
                        }} />
                      ) : (
                        <LightbulbOutlinedIcon sx={{ 
                          fontSize: { 
                            xs: Math.min(30, 300 / Math.max(rows, cols)), 
                            sm: Math.min(40, 400 / Math.max(rows, cols)) 
                          }, 
                          color: '#777' 
                        }} />
                      )}
                    </Box>
                    );
                  })
                )}
              </Box>
            </Box>

            <Divider className="my-3" sx={{ borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }} />

            <Typography 
              variant="body2" 
              align="center"
              sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
            >
              <strong>Левый клик:</strong> изменить лампочку и соседние
              <br />
              <strong>Правый клик:</strong> изменить только эту лампочку
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ background: darkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: darkMode ? '#fff' : '#000' }}>
              Как это работает?
            </Typography>
            <Typography variant="body2" paragraph sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              Lights Out - это математическая головоломка, которая решается с помощью линейной алгебры над полем GF(2).
            </Typography>
            <Typography variant="body2" paragraph sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              <strong>Алгоритм:</strong>
            </Typography>
            <ol style={{ paddingLeft: '20px', margin: '10px 0', color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
              <li style={{ margin: '8px 0' }}>Создаётся система линейных уравнений, где каждая переменная представляет, нужно ли нажать на определённую лампочку</li>
              <li style={{ margin: '8px 0' }}>Используется метод Гаусса для решения системы над полем GF(2) (арифметика по модулю 2)</li>
              <li style={{ margin: '8px 0' }}>Если решение существует, оно показывает минимальное количество нажатий для достижения цели</li>
            </ol>
            <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
              Вы можете выбрать размер доски от 2×2 до 10×10 и решать как задачу выключения всех лампочек, так и включения.
            </Typography>
          </CardContent>
        </Card>
      </Paper>
    </Container>
    </div>
  );
}

export default App;
