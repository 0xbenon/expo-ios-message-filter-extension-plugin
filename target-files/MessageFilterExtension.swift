import IdentityLookup

final class MessageFilterExtension: ILMessageFilterExtension {}

extension MessageFilterExtension: ILMessageFilterQueryHandling {
    func handle(_ queryRequest: ILMessageFilterQueryRequest, context: ILMessageFilterExtensionContext, completion: @escaping (ILMessageFilterQueryResponse) -> Void) {
      
      context.deferQueryRequestToNetwork() { (networkResponse, error) in
          let response = ILMessageFilterQueryResponse()
        
          response.action = .none
        
          if let networkResponse = networkResponse {
              response.action = self.networkAction(for: networkResponse)
          } else {
              NSLog("Error deferring query request to network: \(String(describing: error))")
          }

          completion(response)
      }
    }

    private func networkAction(for networkResponse: ILNetworkResponse) -> (ILMessageFilterAction)
      {
        struct ServerResponse: Codable {
            var sendToJunk: Bool
        }
        
        let decoder = JSONDecoder()
        do{
          let serverResponse = try decoder.decode(ServerResponse.self, from: networkResponse.data)
          
          return serverResponse.sendToJunk ? .junk : .allow
        }catch{
          return .none
        }
      }
}