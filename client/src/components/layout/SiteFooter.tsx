
export function SiteFooter() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Classic Men</p>
      
      <div className="social-icons">
        <a href="https://snapchat.com/t/Es7OCDgr" target="_blank" rel="noopener noreferrer" className="social-icon">
          SnapChat
        </a>
        <a href="https://www.tiktok.com/@the.christ.cultur?_t=ZM-8ug3MPoZh1q&_r=1" target="_blank" rel="noopener noreferrer" className="social-icon">
          Tiktok
        </a>
      </div>
    </footer>
  );
}
