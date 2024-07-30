import { update } from "firebase/database";
import LoginService from "./LoginService";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const API_BASE_URL = 'http://localhost:8080';

class BackendService {
    private static sendMessageEndpoint = `${API_BASE_URL}/chat/send_message`;
    private static getMessageHistoryEndpoint = `${API_BASE_URL}/chat/get_history`;
  
    static async sendMessage(message: string): Promise<any> {
        const authToken = await LoginService.getUserToken();
      try {
        const response = await fetch(this.sendMessageEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ msg: message }),
        });
        if (!response.ok) {
          throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    }
  
    static async fetchChatHistory(): Promise<any[]> {
      const auth = getAuth();
    
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const authToken = await user.getIdToken();
            console.log("Fetching chat history:", authToken);
    
            try {
              const response = await fetch(this.getMessageHistoryEndpoint, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                },
              });
    
              if (!response.ok) {
                throw new Error('Failed to fetch chat history');
              }
    
              const data = await response.json();
              resolve(data.msgs.slice().reverse());
            } catch (error) {
              console.error('Failed to fetch chat history:', error);
              reject(error);
            }
          } else {
            // User is not authenticated
            console.log('User is not authenticated');
            // Example: Redirect to login page
            // window.location.href = '/login';
            resolve([]);
          }
        });
      });
    }

    private static registerUserEndpoint = `${API_BASE_URL}/user/register`;

    static async registerUser(name: string, email: string): Promise<void> {
        const authToken = await LoginService.getUserToken();
        console.log(authToken);
        try {
            const response = await fetch(this.registerUserEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: name, email: email }),
                });
            if (!response.ok) {
                throw new Error('Failed to register user');
            }
        } catch (error) {
            console.error('Failed to register user:', error);
            throw error;
        }
    }

    private static generateCVEndpoint = `${API_BASE_URL}/cv/generate`;

    //GET /gernerate_cv empty body

    static async generateCV(): Promise<any> {
        const authToken = await LoginService.getUserToken();
        console.log(authToken);

        try {
            const response = await fetch(this.generateCVEndpoint, {
                method: 'GET',
                headers: {'Authorization': `Bearer ${authToken}`},
                });
            if (!response.ok) {
                throw new Error('Failed to generate CV');
            }
            return response.json();
        } catch (error) {
            console.error('Failed to generate CV:', error);
            throw error;
        }
    }


  private static updateCVEndpoint = `${API_BASE_URL}/cv/update`;

  static async updateCV(message: string): Promise<any> {
    const authToken = await LoginService.getUserToken();
  try {
    const response = await fetch(this.updateCVEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ msg: message }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update cv: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to update cv:', error);
    throw error;
  }
}

  private static getReportsEndpoint = `${API_BASE_URL}/cv/get_documents`;

  static async getReports(): Promise<any> {
    const authToken = await LoginService.getUserToken();
  try {
    const response = await fetch(this.getReportsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      }});
      if (!response.ok) {
        throw new Error('Failed to get reports');
      }
      return response.json();
  } catch (error) {
      console.error('Failed to get reports:', error);
      throw error;
  }
}

  private static setProfilePhotoEndpoint = `${API_BASE_URL}/user/generate_pfp`;

  static async setProfilePhoto(file: File): Promise<any> {
    const authToken = await LoginService.getUserToken();
    try {
      const formData = new FormData();
      formData.append('file', file);
  
      const response = await fetch(this.setProfilePhotoEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to generate profile photo upload URL:', error);
      throw error;
    }
  }

  private static getProfilePhotoEndpoint = `${API_BASE_URL}/user/get_pfp`;

  static async getProfilePhoto(): Promise<any> {
    const authToken = await LoginService.getUserToken();
    try {
      const response = await fetch(this.getProfilePhotoEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }});
        if (!response.ok) {
          throw new Error('Failed to get profile photo');
        }
        return response.json();
    } catch (error) {
      console.error('Failed to get profile photo:', error);
      throw error;
    }
  }


}





export default BackendService;
  