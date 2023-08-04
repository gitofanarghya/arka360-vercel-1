import { ARKA_AUTH_URL, SL360_URL, ARKA_BASE_URL} from '../../constants'

function getArkaToken() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return user.jwt_encoded_data || ''
}

export default {
    // This can be removed in future when common login has been implemented
    ARKA_LOGIN(postData) {
        return fetch(`${ARKA_AUTH_URL}api/auth/signin/`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            // credentials: 'include',
            body: JSON.stringify(postData),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        })
    },
    CREATE_PROJECT_FOR_ARKA(postData){
        let url = `${SL360_URL}api/projects`;
        let arkaToken = getArkaToken();
        return fetch(url, {
            body: JSON.stringify(postData),
            method: 'POST',
            headers: {
                Authorization: arkaToken,
                'Content-Type': 'application/json'
            }
        })
    },

    GET_PROJECT_ID_FOR_ARKA(tslProjectID){
        let url = `${ARKA_BASE_URL}api/projects/${tslProjectID}/arkaProject`;
        let arkaToken = getArkaToken();
        return fetch(url, {
            method: 'GET',
            headers: {
                Authorization: arkaToken,
            }
        })
    },
    
    FETCH_COMMENTS(projectId) {
        let url = `${SL360_URL}api/comments?tsl_project_ID=${projectId}`
        let arkaToken = getArkaToken()
        return fetch(url, {
            headers: {
                Authorization: arkaToken
            }
        })
    },

    POST_COMMENT(postData) {
        let url = `${SL360_URL}api/comments/tsl`
        let arkaToken = getArkaToken()
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify(postData),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: arkaToken
            }
        })
    },

    DELETE_COMMENT(commentId) {
        let url = `${SL360_URL}api/comments/${commentId}`
        let arkaToken = getArkaToken()
        return fetch(url, {
            method: 'DELETE',
            headers: {
                Authorization: arkaToken
            }
        })
    },

    EDIT_COMMENT(commentId, putData) {
        let url = `${SL360_URL}api/comments/${commentId}`
        let arkaToken = getArkaToken()
        return fetch(url, {
            method: 'PUT',
            body: JSON.stringify(putData),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: arkaToken
            }
        })
    },

    FETCH_SIDEBAR_ITEMS(roleId) {
        let url = `${ARKA_AUTH_URL}api/org/roles/${roleId}/lhs`
        let arkaToken = getArkaToken()
        return fetch(url, {
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
                Authorization: arkaToken
            }
        })
    }
}