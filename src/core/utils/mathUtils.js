// Dummy matrix of N*N size
export function NewMatrix(row, col) {
    const newMatrix = [];
    for (let i = 0; i < row; i += 1) {
        const temp = [];
        for (let j = 0; j < col; j += 1) {
            temp.push(0);
        }
        newMatrix.push(temp);
    }
    return newMatrix;
}

// Function to find determinant of a matrix
export function Determinant(arr, n) {
    let result = 0;
    if (n === 1) {
        return arr[0][0];
    }
    const tempMatrix = NewMatrix(n, n);
    let sign = 1;
    for (let i = 0; i < n; i += 1) {
        let cofactorMat = GetCofactor(arr, tempMatrix, 0, i, n);
        result += (sign) * (arr[0][i]) * (Determinant(cofactorMat, n - 1));
        sign = -sign;
    }
    return result;
}

// Function to find cofactor matrix
export function GetCofactor(arr, tempMat, p, q, n) {
    let i = 0;
    let j = 0;
    for (let row = 0; row < n; row += 1) {
        for (let col = 0; col < n; col += 1) {
            if (row !== p && col !== q) {
                tempMat[i][j++] = arr[row][col];
                if (j === n - 1) {
                    j = 0;
                    i += 1;
                }
            }
        }
    }
    return tempMat;
}

// Function to find inverse of a matrix
export function InverseMatrix(arr, n) {
    const invMatrix = NewMatrix(n, n);
    const det = Determinant(arr, n);
    if (det !== 0) {
        const adjMatrix = NewMatrix(n, n);
        // for( let i = 0; i < n; i++) {
        //     let temp = [];
        //     for( let j = 0; j < n; j++) {
        //         temp.push(0);
        //     };
        //     adj_matrix.push(temp);
        // };
        const adjointMatrix = AdjointMatrix(arr, adjMatrix, n);
        for (let i = 0; i < n; i += 1) {
            for (let j = 0; j < n; j += 1) {
                invMatrix[i][j] = adjointMatrix[i][j] / det;
            }
        }
    }
    return invMatrix;
}

// Function to find adjoint matrix
export function AdjointMatrix(arr, adjMatrix, n) {
    if (n === 1) {
        adjMatrix[0][0] = 1;
        return adjMatrix;
    }
    let sign = 1;
    const tempMatrix = NewMatrix(n, n);
    for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
            const cofactor = GetCofactor(arr, tempMatrix, i, j, n);
            sign = ((i + j) % 2 === 0) ? 1 : -1;
            adjMatrix[j][i] = (sign) * (Determinant(cofactor, n - 1));
        }
    }
    return adjMatrix;
}

// Function to multiply two matrices
export function MultiplyInverseMatrix(row1, col1, matrix1, row2, col2, matrix2) {
    if (row2 === col1) {
        const resultMatrix = NewMatrix(row1, col2);
        if (col2 > 1) {
            for (let i = 0; i < row1; i += 1) {
                for (let j = 0; j < col2; j += 1) {
                    for (let k = 0; k < row2; k += 1) {
                        resultMatrix[i][j] += matrix1[i][k] * matrix2[k][j];
                    }
                }
            }
        }
        else {
            for (let i = 0; i < row1; i += 1) {
                for (let j = 0; j < col2; j += 1) {
                    for (let k = 0; k < row2; k += 1) {
                        resultMatrix[i][j] += matrix1[i][k] * matrix2[k];
                    }
                }
            }
        }
        return resultMatrix;
    }
}

// Function to find lusolve X = B*inv(A)
export function LuSolve(coefficientsMatrix, valueMatrix) {
    const totalDimension = coefficientsMatrix.length;
    const inverseMatrix = InverseMatrix(coefficientsMatrix, totalDimension);
    const rowsValuematrix = valueMatrix.length;
    const colsValuematrix = valueMatrix[0].length ? valueMatrix[0].length : 1;
    const rowsInvmatrix = inverseMatrix.length;
    const colsInvmatrix = inverseMatrix[0].length;
    const lusolvematrix = MultiplyInverseMatrix(rowsInvmatrix, colsInvmatrix, inverseMatrix, rowsValuematrix, colsValuematrix, valueMatrix);
    return lusolvematrix[0][0];
}

// Function to calculate difference between two dates.
export function calculateDiffBtwTwoDates(expiryDate, startDate = null) {
    if (expiryDate) {
        const temp_date1 = expiryDate.split('-');
        const temp_date2 = startDate ? startDate.split('-') : '';
        const expiry_date = new Date(`${temp_date1[1]}/${temp_date1[2]}/${temp_date1[0]}`);
        let current_date = startDate ? new Date(`${temp_date2[1]}/${temp_date2[2]}/${temp_date2[0]}`) : new Date();
        const Difference_In_Time = expiry_date.getTime() - current_date.getTime();
        const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        return parseInt(Difference_In_Days);
    }
};