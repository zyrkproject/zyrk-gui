import { ZyrkGUIPage } from './app.po';

describe('Zyrk GUI App', () => {
  let page: ZyrkGUIPage;

  beforeEach(() => {
    page = new ZyrkGUIPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
