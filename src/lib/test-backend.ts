/**
 * Test backend connectivity and basic functionality
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function testBackendConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Backend connection successful:', data)
      return { success: true, data }
    } else {
      console.error('❌ Backend connection failed:', data)
      return { success: false, error: data }
    }
  } catch (error) {
    console.error('❌ Backend connection error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function testGenerateImage(prompt: string = "a cute cat in ghibli style") {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test/test-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        width: 512,
        height: 512
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Test generation successful:', data)
      return { success: true, data }
    } else {
      console.error('❌ Test generation failed:', data)
      return { success: false, error: data }
    }
  } catch (error) {
    console.error('❌ Test generation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function testGetModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test/test-models`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Test models successful:', data)
      return { success: true, data }
    } else {
      console.error('❌ Test models failed:', data)
      return { success: false, error: data }
    }
  } catch (error) {
    console.error('❌ Test models error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}