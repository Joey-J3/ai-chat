import { ChatCompletionResponseMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from "openai";

function myAdapter(config: any) {
  // At this point:
  //  - config has been merged with defaults
  //  - request transformers have already run
  //  - request interceptors have already run
  
  // Make the request using config provided
  // Upon response settle the Promise

  return new Promise(function(resolve, reject) {
  
    var response = {
      data: responseData,
      status: request.status,
      statusText: request.statusText,
      headers: responseHeaders,
      config: config,
      request: request
    };

    settle(resolve, reject, response);

    // From here:
    //  - response transformers will run
    //  - response interceptors will run
  });
}

class OpenAI {
  openai: OpenAIApi
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
      // organization: process.env.OPENAI_API_ORG,
    });
    this.openai = new OpenAIApi(configuration);
  }
  async chatGPT(params: CreateChatCompletionRequest): Promise<ChatCompletionResponseMessage | undefined> {
    try {
      const completion = await this.openai.createChatCompletion(params);
      return completion.data.choices[0].message
    } catch (error) {
      console.error(error);
    }
  }
  async getComletion() {
    try {
      const completion = await this.openai.createCompletion({
        model: "text-davinci-003",
        prompt: "Hello world",
      });
      console.log(completion.data.choices[0].text);
    } catch (error) {
      const { response, message } = error as any
      if (response) {
        console.log(response.status);
        console.log(response.data);
      } else {
        console.log(message);
      }
    }
  }
}

export default new OpenAI()